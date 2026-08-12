@kwdef mutable struct Weex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    nonce::Function = nonce
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchTickers::Function = fetchTickers
    fetchBidsAsks::Function = fetchBidsAsks
    parseTicker::Function = parseTicker
    fetchLastPrices::Function = fetchLastPrices
    parseLastPrice::Function = parseLastPrice
    fetchMarkPrice::Function = fetchMarkPrice
    fetchMarkPrices::Function = fetchMarkPrices
    fetchOrderBook::Function = fetchOrderBook
    fetchOHLCV::Function = fetchOHLCV
    fetchSpotOHLCV::Function = fetchSpotOHLCV
    fetchContractOHLCV::Function = fetchContractOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchTransfers::Function = fetchTransfers
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    createOrder::Function = createOrder
    createSpotOrder::Function = createSpotOrder
    createSpotOrderRequest::Function = createSpotOrderRequest
    createContractOrder::Function = createContractOrder
    createContractOrderRequest::Function = createContractOrderRequest
    encodeTriggerPriceType::Function = encodeTriggerPriceType
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelOrders::Function = cancelOrders
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchOrders::Function = fetchOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    handleOrderOrPositionError::Function = handleOrderOrPositionError
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerType::Function = parseLedgerType
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    fetchPositionsForSymbol::Function = fetchPositionsForSymbol
    parsePosition::Function = parsePosition
    closeAllPositions::Function = closeAllPositions
    closePosition::Function = closePosition
    fetchTradingFee::Function = fetchTradingFee
    parseTradingFee::Function = parseTradingFee
    fetchMarginMode::Function = fetchMarginMode
    fetchMarginModes::Function = fetchMarginModes
    parseMarginMode::Function = parseMarginMode
    parseMarginType::Function = parseMarginType
    setMarginMode::Function = setMarginMode
    encodeMarginMode::Function = encodeMarginMode
    fetchLeverage::Function = fetchLeverage
    fetchLeverages::Function = fetchLeverages
    parseLeverage::Function = parseLeverage
    setLeverage::Function = setLeverage
    fetchPositionMode::Function = fetchPositionMode
    setPositionMode::Function = setPositionMode
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    toSandboxMarketId::Function = toSandboxMarketId
    fromSandboxMarketId::Function = fromSandboxMarketId
    setSandboxMode::Function = setSandboxMode
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetApiV3Time::Function = publicGetApiV3Time
    publicGetApiV3Coins::Function = publicGetApiV3Coins
    publicGetApiV3ExchangeInfo::Function = publicGetApiV3ExchangeInfo
    publicGetApiV3Ping::Function = publicGetApiV3Ping
    publicGetApiV3ApiTradingSymbols::Function = publicGetApiV3ApiTradingSymbols
    publicGetApiV3MarketTickerPrice::Function = publicGetApiV3MarketTickerPrice
    publicGetApiV3MarketTicker24hr::Function = publicGetApiV3MarketTicker24hr
    publicGetApiV3MarketTrades::Function = publicGetApiV3MarketTrades
    publicGetApiV3MarketKlines::Function = publicGetApiV3MarketKlines
    publicGetApiV3MarketDepth::Function = publicGetApiV3MarketDepth
    publicGetApiV3MarketTickerBookTicker::Function = publicGetApiV3MarketTickerBookTicker
    privateGetApiV3Account::Function = privateGetApiV3Account
    privateGetApiV3AccountTransferRecords::Function = privateGetApiV3AccountTransferRecords
    privateGetApiV3Order::Function = privateGetApiV3Order
    privateGetApiV3OpenOrders::Function = privateGetApiV3OpenOrders
    privateGetApiV3AllOrders::Function = privateGetApiV3AllOrders
    privateGetApiV3MyTrades::Function = privateGetApiV3MyTrades
    privateGetApiV3RebateAffiliateGetAffiliateUIDs::Function = privateGetApiV3RebateAffiliateGetAffiliateUIDs
    privateGetApiV3RebateAffiliateGetChannelUserTradeAndAsset::Function = privateGetApiV3RebateAffiliateGetChannelUserTradeAndAsset
    privateGetApiV3RebateAffiliateGetAffiliateCommission::Function = privateGetApiV3RebateAffiliateGetAffiliateCommission
    privateGetApiV3RebateAffiliateGetInternalWithdrawalStatus::Function = privateGetApiV3RebateAffiliateGetInternalWithdrawalStatus
    privateGetApiV3RebateAffiliateQuerySubChannelTransactions::Function = privateGetApiV3RebateAffiliateQuerySubChannelTransactions
    privateGetApiV3AgencyVerifyReferrals::Function = privateGetApiV3AgencyVerifyReferrals
    privateGetApiV3AgencyGetAssert::Function = privateGetApiV3AgencyGetAssert
    privateGetApiV3AgencyGetDealData::Function = privateGetApiV3AgencyGetDealData
    privatePostApiV3AccountBills::Function = privatePostApiV3AccountBills
    privatePostApiV3AccountFundingBills::Function = privatePostApiV3AccountFundingBills
    privatePostApiV3Order::Function = privatePostApiV3Order
    privatePostApiV3OrderBatch::Function = privatePostApiV3OrderBatch
    privatePostApiV3RebateAffiliateInternalWithdrawal::Function = privatePostApiV3RebateAffiliateInternalWithdrawal
    privateDeleteApiV3Order::Function = privateDeleteApiV3Order
    privateDeleteApiV3OpenOrders::Function = privateDeleteApiV3OpenOrders
    privateDeleteApiV3OrderBatch::Function = privateDeleteApiV3OrderBatch
    contractGetCapiV3MarketTime::Function = contractGetCapiV3MarketTime
    contractGetCapiV3MarketExchangeInfo::Function = contractGetCapiV3MarketExchangeInfo
    contractGetCapiV3MarketDepth::Function = contractGetCapiV3MarketDepth
    contractGetCapiV3MarketTicker24hr::Function = contractGetCapiV3MarketTicker24hr
    contractGetCapiV3MarketTickerBookTicker::Function = contractGetCapiV3MarketTickerBookTicker
    contractGetCapiV3MarketTrades::Function = contractGetCapiV3MarketTrades
    contractGetCapiV3MarketKlines::Function = contractGetCapiV3MarketKlines
    contractGetCapiV3MarketIndexPriceKlines::Function = contractGetCapiV3MarketIndexPriceKlines
    contractGetCapiV3MarketMarkPriceKlines::Function = contractGetCapiV3MarketMarkPriceKlines
    contractGetCapiV3MarketHistoryKlines::Function = contractGetCapiV3MarketHistoryKlines
    contractGetCapiV3MarketSymbolPrice::Function = contractGetCapiV3MarketSymbolPrice
    contractGetCapiV3MarketOpenInterest::Function = contractGetCapiV3MarketOpenInterest
    contractGetCapiV3MarketPremiumIndex::Function = contractGetCapiV3MarketPremiumIndex
    contractGetCapiV3MarketFundingRate::Function = contractGetCapiV3MarketFundingRate
    contractGetCapiV3MarketApiTradingSymbols::Function = contractGetCapiV3MarketApiTradingSymbols
    contractPrivateGetCapiV3AccountBalance::Function = contractPrivateGetCapiV3AccountBalance
    contractPrivateGetCapiV3AccountCommissionRate::Function = contractPrivateGetCapiV3AccountCommissionRate
    contractPrivateGetCapiV3AccountAccountConfig::Function = contractPrivateGetCapiV3AccountAccountConfig
    contractPrivateGetCapiV3AccountSymbolConfig::Function = contractPrivateGetCapiV3AccountSymbolConfig
    contractPrivateGetCapiV3AccountPositionAllPosition::Function = contractPrivateGetCapiV3AccountPositionAllPosition
    contractPrivateGetCapiV3AccountPositionSinglePosition::Function = contractPrivateGetCapiV3AccountPositionSinglePosition
    contractPrivateGetCapiV3Order::Function = contractPrivateGetCapiV3Order
    contractPrivateGetCapiV3OpenOrders::Function = contractPrivateGetCapiV3OpenOrders
    contractPrivateGetCapiV3OrderHistory::Function = contractPrivateGetCapiV3OrderHistory
    contractPrivateGetCapiV3UserTrades::Function = contractPrivateGetCapiV3UserTrades
    contractPrivateGetCapiV3OpenAlgoOrders::Function = contractPrivateGetCapiV3OpenAlgoOrders
    contractPrivateGetCapiV3AllAlgoOrders::Function = contractPrivateGetCapiV3AllAlgoOrders
    contractPrivateGetCapiV3SimBalance::Function = contractPrivateGetCapiV3SimBalance
    contractPrivateGetCapiV3SimPositionAllPosition::Function = contractPrivateGetCapiV3SimPositionAllPosition
    contractPrivateGetCapiV3SimOrderHistory::Function = contractPrivateGetCapiV3SimOrderHistory
    contractPrivatePostCapiV3AccountIncome::Function = contractPrivatePostCapiV3AccountIncome
    contractPrivatePostCapiV3AccountMarginType::Function = contractPrivatePostCapiV3AccountMarginType
    contractPrivatePostCapiV3AccountLeverage::Function = contractPrivatePostCapiV3AccountLeverage
    contractPrivatePostCapiV3AccountPositionMargin::Function = contractPrivatePostCapiV3AccountPositionMargin
    contractPrivatePostCapiV3AccountModifyAutoAppendMargin::Function = contractPrivatePostCapiV3AccountModifyAutoAppendMargin
    contractPrivatePostCapiV3Order::Function = contractPrivatePostCapiV3Order
    contractPrivatePostCapiV3BatchOrders::Function = contractPrivatePostCapiV3BatchOrders
    contractPrivatePostCapiV3ClosePositions::Function = contractPrivatePostCapiV3ClosePositions
    contractPrivatePostCapiV3AlgoOrder::Function = contractPrivatePostCapiV3AlgoOrder
    contractPrivatePostCapiV3PlaceTpSlOrder::Function = contractPrivatePostCapiV3PlaceTpSlOrder
    contractPrivatePostCapiV3ModifyTpSlOrder::Function = contractPrivatePostCapiV3ModifyTpSlOrder
    contractPrivatePostCapiV3SimOrder::Function = contractPrivatePostCapiV3SimOrder
    contractPrivateDeleteCapiV3Order::Function = contractPrivateDeleteCapiV3Order
    contractPrivateDeleteCapiV3BatchOrders::Function = contractPrivateDeleteCapiV3BatchOrders
    contractPrivateDeleteCapiV3AllOpenOrders::Function = contractPrivateDeleteCapiV3AllOpenOrders
    contractPrivateDeleteCapiV3AlgoOrder::Function = contractPrivateDeleteCapiV3AlgoOrder
    contractPrivateDeleteCapiV3AlgoOpenOrders::Function = contractPrivateDeleteCapiV3AlgoOpenOrders

end
function describe(self::Weex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "weex",
    Symbol("name") => "Weex",
    Symbol("countries") => ["SG"],
    Symbol("rateLimit") => 20,
    Symbol("version") => "v3",
    Symbol("certified") => false,
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
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelOrdersWithClientOrderId") => true,
        Symbol("cancelOrderWithClientOrderId") => true,
        Symbol("closeAllPositions") => true,
        Symbol("closePosition") => true,
        Symbol("createDepositAddress") => false,
        Symbol("createLimitBuyOrder") => true,
        Symbol("createLimitOrder") => true,
        Symbol("createLimitSellOrder") => true,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrder") => true,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => false,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopLossOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => false,
        Symbol("deposit") => false,
        Symbol("editOrder") => false,
        Symbol("editOrders") => false,
        Symbol("editOrderWithClientOrderId") => false,
        Symbol("fetchAccounts") => false,
        Symbol("fetchADLRank") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchL2OrderBook") => false,
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLastPrices") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarginModes") => true,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMarkPrice") => true,
        Symbol("fetchMarkPrices") => true,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrdersByStatus") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchOrderWithClientOrderId") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionADLRank") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => false,
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
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawAddresses") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("privateAPI") => false,
        Symbol("publicAPI") => false,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/bc67b9f2-75d2-4b8d-963a-18f2fcd9d13c",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api-spot.weex.com",
            Symbol("private") => "https://api-spot.weex.com",
            Symbol("contract") => "https://api-contract.weex.com",
            Symbol("contractPrivate") => "https://api-contract.weex.com"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://api-spot.weex.com",
            Symbol("private") => "https://api-spot.weex.com",
            Symbol("contract") => "https://api-contract.weex.com",
            Symbol("contractPrivate") => "https://api-contract.weex.com"
        ),
        Symbol("www") => "https://www.weex.com",
        Symbol("doc") => ["https://www.weex.com/api-doc"],
        Symbol("referral") => "https://www.weex.com/register?vipCode=qfyh"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/v3/time") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v3/coins") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("api/v3/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("api/v3/ping") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v3/apiTradingSymbols") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("api/v3/market/ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("api/v3/market/ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("api/v3/market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 125
),
                Symbol("api/v3/market/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("api/v3/market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("api/v3/market/ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/v3/account/") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v3/account/transferRecords") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("api/v3/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("api/v3/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("api/v3/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("api/v3/myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v3/rebate/affiliate/getAffiliateUIDs") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("api/v3/rebate/affiliate/getChannelUserTradeAndAsset") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("api/v3/rebate/affiliate/getAffiliateCommission") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("api/v3/rebate/affiliate/getInternalWithdrawalStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("api/v3/rebate/affiliate/querySubChannelTransactions") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("api/v3/agency/verifyReferrals") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("api/v3/agency/getAssert") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("api/v3/agency/getDealData") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("api/v3/account/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v3/account/fundingBills") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v3/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v3/order/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("api/v3/rebate/affiliate/internalWithdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 100
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("api/v3/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v3/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v3/order/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            )
        ),
        Symbol("contract") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("capi/v3/market/time") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 200
),
                Symbol("capi/v3/market/ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("capi/v3/market/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/indexPriceKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/markPriceKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/historyKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("capi/v3/market/symbolPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/openInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/market/premiumIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/market/fundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("capi/v3/market/apiTradingSymbols") => Dict{Symbol, Any}(
    Symbol("cost") => 25
)
            )
        ),
        Symbol("contractPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("capi/v3/account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/account/commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/account/accountConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/account/symbolConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/account/position/allPosition") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("capi/v3/account/position/singlePosition") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("capi/v3/order") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("capi/v3/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/openAlgoOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("capi/v3/allAlgoOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/sim/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/sim/position/allPosition") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("capi/v3/sim/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("capi/v3/account/income") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/account/marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("capi/v3/account/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("capi/v3/account/positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("capi/v3/account/modifyAutoAppendMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("capi/v3/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/closePositions") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("capi/v3/algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/placeTpSlOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/modifyTpSlOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("capi/v3/sim/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("capi/v3/order") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("capi/v3/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capi/v3/algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("capi/v3/algoOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            )
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("password") => true
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
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-1000") => ExchangeError,
            Symbol("-1054") => ExchangeError,
            Symbol("-1040") => AuthenticationError,
            Symbol("-1041") => AuthenticationError,
            Symbol("-1042") => AuthenticationError,
            Symbol("-1043") => AuthenticationError,
            Symbol("-1044") => AuthenticationError,
            Symbol("-1045") => BadRequest,
            Symbol("-1046") => BadRequest,
            Symbol("-1047") => AuthenticationError,
            Symbol("-1049") => AuthenticationError,
            Symbol("-1050") => PermissionDenied,
            Symbol("-1051") => PermissionDenied,
            Symbol("-1052") => PermissionDenied,
            Symbol("-1053") => PermissionDenied,
            Symbol("-1055") => PermissionDenied,
            Symbol("-1056") => PermissionDenied,
            Symbol("-1057") => PermissionDenied,
            Symbol("-1058") => PermissionDenied,
            Symbol("-1115") => InvalidOrder,
            Symbol("-1116") => InvalidOrder,
            Symbol("-1117") => InvalidOrder,
            Symbol("-1121") => BadSymbol,
            Symbol("-1128") => BadRequest,
            Symbol("-1135") => BadRequest,
            Symbol("-1140") => BadRequest,
            Symbol("-1141") => ArgumentsRequired,
            Symbol("-1142") => BadRequest,
            Symbol("-1150") => BadRequest,
            Symbol("-1160") => BadRequest,
            Symbol("-1170") => BadRequest,
            Symbol("-1171") => BadRequest,
            Symbol("-1180") => InvalidOrder,
            Symbol("-1190") => PermissionDenied,
            Symbol("-2007") => BadSymbol,
            Symbol("-2200") => OrderNotFound,
            Symbol("-3006") => InvalidOrder,
            Symbol("-3007") => InvalidOrder,
            Symbol("-3200") => InvalidOrder,
            Symbol("-3235") => PermissionDenied,
            Symbol("-3236") => PermissionDenied,
            Symbol("-3313") => InvalidOrder,
            Symbol("-3613") => ExchangeError,
            Symbol("FAILED_ORDER_NOT_FOUND") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("amount not enough") => InsufficientFunds,
            Symbol("INVALID_ARGUMENT") => BadRequest
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.1"),
            Symbol("maker") => self.parseNumber("0.1"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.1")], [self.parseNumber("500000"), self.parseNumber("0.09")], [self.parseNumber("1000000"), self.parseNumber("0.08")], [self.parseNumber("2000000"), self.parseNumber("0.06")], [self.parseNumber("5000000"), self.parseNumber("0.05")], [self.parseNumber("10000000"), self.parseNumber("0.04")], [self.parseNumber("25000000"), self.parseNumber("0.03")], [self.parseNumber("50000000"), self.parseNumber("0.02")], [self.parseNumber("100000000"), self.parseNumber("0")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.1")], [self.parseNumber("500000"), self.parseNumber("0.08")], [self.parseNumber("1000000"), self.parseNumber("0.07")], [self.parseNumber("2000000"), self.parseNumber("0.05")], [self.parseNumber("5000000"), self.parseNumber("0.04")], [self.parseNumber("10000000"), self.parseNumber("0.03")], [self.parseNumber("25000000"), self.parseNumber("0.02")], [self.parseNumber("50000000"), self.parseNumber("0.01")], [self.parseNumber("100000000"), self.parseNumber("0")]]
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.1"),
            Symbol("maker") => self.parseNumber("0.1"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.1")], [self.parseNumber("500000"), self.parseNumber("0.09")], [self.parseNumber("1000000"), self.parseNumber("0.08")], [self.parseNumber("2000000"), self.parseNumber("0.06")], [self.parseNumber("5000000"), self.parseNumber("0.05")], [self.parseNumber("10000000"), self.parseNumber("0.04")], [self.parseNumber("25000000"), self.parseNumber("0.03")], [self.parseNumber("50000000"), self.parseNumber("0.02")], [self.parseNumber("100000000"), self.parseNumber("0")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.1")], [self.parseNumber("500000"), self.parseNumber("0.08")], [self.parseNumber("1000000"), self.parseNumber("0.07")], [self.parseNumber("2000000"), self.parseNumber("0.05")], [self.parseNumber("5000000"), self.parseNumber("0.04")], [self.parseNumber("10000000"), self.parseNumber("0.03")], [self.parseNumber("25000000"), self.parseNumber("0.02")], [self.parseNumber("50000000"), self.parseNumber("0.01")], [self.parseNumber("100000000"), self.parseNumber("0")]]
            )
        ),
        Symbol("contract") => Dict{Symbol, Any}(
            Symbol("feeSide") => "quote",
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.08"),
            Symbol("maker") => self.parseNumber("0.02"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.08")], [self.parseNumber("1000000"), self.parseNumber("0.075")], [self.parseNumber("5000000"), self.parseNumber("0.06")], [self.parseNumber("10000000"), self.parseNumber("0.055")], [self.parseNumber("30000000"), self.parseNumber("0.05")], [self.parseNumber("50000000"), self.parseNumber("0.048")], [self.parseNumber("100000000"), self.parseNumber("0.045")], [self.parseNumber("300000000"), self.parseNumber("0.042")], [self.parseNumber("500000000"), self.parseNumber("0.04")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.02")], [self.parseNumber("1000000"), self.parseNumber("0.02")], [self.parseNumber("5000000"), self.parseNumber("0.018")], [self.parseNumber("10000000"), self.parseNumber("0.018")], [self.parseNumber("30000000"), self.parseNumber("0.016")], [self.parseNumber("50000000"), self.parseNumber("0.016")], [self.parseNumber("100000000"), self.parseNumber("0.014")], [self.parseNumber("300000000"), self.parseNumber("0.012")], [self.parseNumber("500000000"), self.parseNumber("0.01")]]
            )
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("XBT") => "XBT"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("partner") => "b-WEEX111125",
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "spot",
            Symbol("trading") => "spot",
            Symbol("fund") => "funding",
            Symbol("funding") => "funding",
            Symbol("swap") => "contract",
            Symbol("contract") => "contract",
            Symbol("futures") => "contract"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BEP20") => "BEP20(BSC)",
            Symbol("BSC") => "BEP20(BSC)",
            Symbol("ERC20") => "ERC20",
            Symbol("ETH") => "ERC20",
            Symbol("POLYGON") => "POLYGON(MATIC)",
            Symbol("MATIC") => "POLYGON(MATIC)",
            Symbol("ARBITRUM") => "ARBITRUM(ARB)",
            Symbol("SOL") => "SOLANA(SOL)",
            Symbol("OP") => "OPTIMISM(OP)",
            Symbol("OPTIMISM") => "OPTIMISM(OP)",
            Symbol("AVAXC") => "AVALANCHE_C(AVAX_C)"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("BEP20(BSC)") => "BEP20",
            Symbol("ERC20") => "ERC20",
            Symbol("POLYGON(MATIC)") => "MATIC",
            Symbol("ARBITRUM(ARB)") => "ARBITRUM",
            Symbol("SOLANA(SOL)") => "SOL",
            Symbol("OPTIMISM(OP)") => "OP",
            Symbol("AVALANCHE_C(AVAX_C)") => "AVAXC"
        ),
        Symbol("timeframes") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("1m") => "1m",
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
            Symbol("contract") => Dict{Symbol, Any}(
                Symbol("1m") => "1m",
                Symbol("5m") => "5m",
                Symbol("15m") => "15m",
                Symbol("30m") => "30m",
                Symbol("1h") => "1h",
                Symbol("4h") => "4h",
                Symbol("12h") => "12h",
                Symbol("1d") => "1d",
                Symbol("1w") => "1w"
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("test") => false,
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => nothing,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => false,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300
            )
        ),
        Symbol("forDerivs") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("last") => true,
                        Symbol("mark") => true,
                        Symbol("index") => false
                    ),
                    Symbol("price") => false
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => false,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
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
                Symbol("limit") => 100,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchCanceledAndClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivs"
            ),
            Symbol("inverse") => nothing
        )
    )
))

end
function nonce(self::Weex, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
"""
the latest known information on the availability of the exchange API
see: https://www.weex.com/api-doc/spot/ConfigAPI/Ping

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Weex; params=Dict())
    response = Base.fetch(self.publicGetApiV3Ping(params));
    return Dict{Symbol, Any}(
    Symbol("status") => "ok",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://www.weex.com/api-doc/spot/ConfigAPI/GetServerTime
see: https://www.weex.com/api-doc/contract/Market_API/GetServerTime

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', default is 'spot'

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Weex; params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTime", market = nothing, params = params);
    response = nothing;
    if functions.ccxtruthy(type_var != "spot")
        response = Base.fetch(self.contractGetCapiV3MarketTime(params));
    else
        response = Base.fetch(self.publicGetApiV3Time(params));
    end
    return safeInteger(response, "serverTime")

end
"""
fetches all available currencies on an exchange
see: https://www.weex.com/api-doc/spot/ConfigAPI/CurrencyInfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Weex; params=Dict())
    response = Base.fetch(self.publicGetApiV3Coins(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Weex, rawCurrency)
    currencyId = safeString(rawCurrency, "coin");
    code = self.safeCurrencyCode(currencyId);
    name = safeString(rawCurrency, "name");
    networks = Dict{Symbol, Any}();
    chains = self.safeList(rawCurrency, "networkList", defaultValue = []);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = self.safeDict(chains, j);
        networkId = safeString(chain, "network");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => chain,
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("deposit") => self.safeBool(chain, "depositEnable"),
                Symbol("withdraw") => self.safeBool(chain, "withdrawEnable"),
                Symbol("fee") => self.safeNumber(chain, "withdrawFee"),
                Symbol("precision") => self.safeNumber(chain, "withdrawIntegerMultiple"),
                Symbol("isDefault") => self.safeBool(chain, "isDefault", defaultValue = false),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "withdrawMin"),
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "depositDust"),
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    networkKeys = objectKeys(networks);
    networksLength = length(networkKeys);
    emptyChains = networksLength == 0;
    valueForEmpty = functions.ccxtruthy(emptyChains) ? false : nothing;
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("type") => "crypto",
    Symbol("name") => name,
    Symbol("active") => nothing,
    Symbol("deposit") => valueForEmpty,
    Symbol("withdraw") => valueForEmpty,
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
    Symbol("networks") => networks
))

end
"""
retrieves data on all markets for exchagne
see: https://www.weex.com/api-doc/spot/ConfigAPI/GetProductInfo // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetContractInfo // contract

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Weex; params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    promises = [self.publicGetApiV3ExchangeInfo(params), self.contractGetCapiV3MarketExchangeInfo(params)];
    (spotResponse, contractResponse) = (Base.fetch(asyncmap(Base.fetch, promises)));
    spotArray = self.safeList(spotResponse, "symbols", defaultValue = []);
    contractArray = self.safeList(contractResponse, "symbols", defaultValue = []);
    result = arrayConcat(spotArray, contractArray);
    return self.parseMarkets(result)

end
function parseMarket(self::Weex, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "baseAsset");
    quoteId = safeString(market, "quoteAsset");
    settleId = safeString(market, "marginAsset");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settle = self.safeCurrencyCode(settleId);
    active = true;
    symbol = string(base, "/", quote_var);
    isSpot = true;
    isLinear = nothing;
    isInverse = nothing;
    if functions.ccxtruthy(settle != nothing)
        symbol += string(":", settle);
        isSpot = false;
        if functions.ccxtruthy(settle == quote_var)
            isLinear = true;
            isInverse = false;
        elseif functions.ccxtruthy(settle == base)
            isLinear = false;
            isInverse = true;
        end
    else
        active = self.safeBool(market, "enableTrade", defaultValue = false);
    end
    amountPrecision = self.safeNumber(market, "stepSize");
    pricePrecision = self.safeNumber(market, "tickSize");
    if functions.ccxtruthy(amountPrecision == nothing)
        amountPrecisionString = self.parsePrecision(precision = safeString(market, "quantityPrecision"));
        pricePrecisionString = self.parsePrecision(precision = safeString(market, "pricePrecision"));
        amountPrecision = self.parseNumber(amountPrecisionString);
        pricePrecision = self.parseNumber(pricePrecisionString);
    end
    fees = self.safeDict(self.fees, functions.ccxtruthy(isSpot) ? "spot" : "contract", defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(id == nothing)
        throw(ExchangeError(string(self.id, " method() missing id")));
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("lowercaseId") => lowercase(id),
    Symbol("numericId") => safeInteger(market, "contractId"),
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => functions.ccxtruthy(isSpot) ? "spot" : "swap",
    Symbol("spot") => isSpot,
    Symbol("margin") => false,
    Symbol("swap") => !functions.ccxtruthy(isSpot),
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => !functions.ccxtruthy(isSpot),
    Symbol("linear") => isLinear,
    Symbol("inverse") => isInverse,
    Symbol("taker") => self.safeNumber(market, "takerFeeRate"),
    Symbol("maker") => self.safeNumber(market, "makerFeeRate"),
    Symbol("feeSide") => get(fees, Symbol("feeSide"), nothing),
    Symbol("contractSize") => self.safeNumber(market, "contractVal"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => pricePrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minLeverage"),
            Symbol("max") => self.safeNumber(market, "maxLeverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber2(market, "minTradeAmount", "minOrderSize"),
            Symbol("max") => self.safeNumber2(market, "maxTradeAmount", "maxOrderSize")
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
    Symbol("created") => nothing,
    Symbol("percentage") => get(fees, Symbol("percentage"), nothing),
    Symbol("tierBased") => get(fees, Symbol("tierBased"), nothing),
    Symbol("tiers") => get(fees, Symbol("tiers"), nothing),
    Symbol("info") => market
))

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetAllTickerInfo // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetTicker24h // contract

# Arguments
- `symbols`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', default is 'spot' (used if symbols are not provided)

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Weex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    symbolsLength = 0;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbolsLength == 1)
        request[Symbol("symbol")] = safeString(market, "id");
    end
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.publicGetApiV3MarketTicker24hr(extend(request, params)));
    else
        response = Base.fetch(self.contractGetCapiV3MarketTicker24hr(extend(request, params)));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(response)))
        response = [response];
    end
    return self.parseTickers(response, symbols = symbols)

end
"""
fetches the bid and ask price and volume for multiple markets
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetBookTicker // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetBookTicker // contract

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', default is 'spot' (used if symbols are not provided)

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchBidsAsks(self::Weex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBidsAsks", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.publicGetApiV3MarketTickerBookTicker(params));
    else
        response = Base.fetch(self.contractGetCapiV3MarketTickerBookTicker(params));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(response)))
        response = [response];
    end
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        rawTicker = get(response, i + 1, nothing);
        marketId = safeString(rawTicker, "symbol");
        tickerMarket = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = marketType);
        push!(results, self.parseTicker(rawTicker, market = tickerMarket));
        i += 1
    end
    return self.filterByArrayTickers(results, "symbol", values = symbols)

end
function parseTicker(self::Weex, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    markPrice = safeString(ticker, "markPrice");
    marketType = "spot";
    if functions.ccxtruthy(@functions.ccxt_or((markPrice != nothing), (@functions.ccxt_and((market != nothing), get(market, Symbol("contract"), nothing)))))
        marketType = "swap";
    end
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
    timestamp = safeInteger2(ticker, "closeTime", "time");
    percentage = stringMul(safeString(ticker, "priceChangePercent"), "100");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "highPrice"),
    Symbol("low") => safeString(ticker, "lowPrice"),
    Symbol("bid") => safeString(ticker, "bidPrice"),
    Symbol("bidVolume") => safeString(ticker, "bidQty"),
    Symbol("ask") => safeString(ticker, "askPrice"),
    Symbol("askVolume") => safeString(ticker, "askQty"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "openPrice"),
    Symbol("close") => safeString(ticker, "lastPrice"),
    Symbol("last") => safeString(ticker, "lastPrice"),
    Symbol("previousClose") => nothing,
    Symbol("change") => safeString(ticker, "priceChange"),
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "volume"),
    Symbol("quoteVolume") => safeString(ticker, "quoteVolume"),
    Symbol("markPrice") => markPrice,
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches the last price for multiple markets
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetTickerInfo

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the last prices for, all spot markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of lastprice structures
"""
function fetchLastPrices(self::Weex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchLastPrices", market = market, params = params);
    if functions.ccxtruthy(type_var != "spot")
        throw(NotSupported(string(self.id, " fetchLastPrices() supports spot markets only, use fetchMarkPrices() or fetchTickers() for contract markets")));
    end
    response = Base.fetch(self.publicGetApiV3MarketTickerPrice(params));
    return self.parseLastPrices(response, symbols = symbols)

end
function parseLastPrice(self::Weex, entry; market=nothing)
    marketId = safeString(entry, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "spot");
    return Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("price") => self.safeNumberOmitZero(entry, "price"),
    Symbol("side") => nothing,
    Symbol("info") => entry
)

end
"""
fetches mark price for the market
see: https://www.weex.com/api-doc/contract/Market_API/GetSymbolPrice

# Arguments
- `symbol`::string: unified symbol of the market to fetch the mark price for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.priceType`::string, optional: "MARK" (default) or "INDEX", with "INDEX" the price is returned as the indexPrice of the ticker

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrice(self::Weex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(NotSupported(string(self.id, " fetchMarkPrice() supports contract markets only")));
    end
    priceType = nothing;
    (priceType, params) = self.handleOptionAndParams(params, "fetchMarkPrice", "priceType", defaultValue = "MARK");
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("priceType") => priceType
    );
    response = Base.fetch(self.contractGetCapiV3MarketSymbolPrice(extend(request, params)));
    ticker = extend(Dict{Symbol, Any}(), response);
    if functions.ccxtruthy(priceType == "INDEX")
        ticker[Symbol("indexPrice")] = safeString(ticker, "price");
    else
        ticker[Symbol("markPrice")] = safeString(ticker, "price");
    end
    return self.parseTicker(ticker, market = market)

end
"""
fetches mark prices for multiple markets
see: https://www.weex.com/api-doc/contract/Market_API/GetCurrentFundingRate

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the mark prices for, all contract markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrices(self::Weex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = "swap");
    response = Base.fetch(self.contractGetCapiV3MarketPremiumIndex(params));
    return self.parseTickers(response, symbols = symbols)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetDepthData // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetDepthData // contract

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return (default 15, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Weex, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(@functions.ccxt_and((limit != nothing), (functions.ccxt_gt(limit, 15))))
        request[Symbol("limit")] = 200;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.publicGetApiV3MarketDepth(extend(request, params)));
    else
        response = Base.fetch(self.contractGetCapiV3MarketDepth(extend(request, params)));
    end
    orderbook = self.parseOrderBook(response, symbol);
    orderbook[Symbol("nonce")] = safeInteger(response, "lastUpdateId");
    return orderbook

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
see: https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
see: https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
see: https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch (default 100, max 300)
- `params`::object, optional: extra parameters specific to the exchange API endpoint Check fetchSpotOHLCV() and fetchContractOHLCV() for more details on the extra parameters that can be used in params

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Weex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return Base.fetch(self.fetchSpotOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = params))
    else
        return Base.fetch(self.fetchContractOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = params))
    end

end
"""
helper method for fetchOHLCV
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchSpotOHLCV(self::Weex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    response = Base.fetch(self.publicGetApiV3MarketKlines(extend(request, params)));
    return self.parseOHLCVs(toArray(response), market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
helper method for fetchOHLCV
see: https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
see: https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
see: https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
see: https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch (default 100, max 100 for historical klines, max 1000 for other contract klines)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: whether to automatically paginate requests until the required number of candles is returned
- `params.historical`::bool, optional: whether to fetch historical klines (default is false). If false, will fetch last price klines

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchContractOHLCV(self::Weex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxHistoricalLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
        params = extend(params, Dict{Symbol, Any}(
    Symbol("historical") => true
));
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxHistoricalLimit))
    end
    until = safeInteger(params, "until");
    historical = false;
    (historical, params) = self.handleOptionAndParams(params, "fetchOHLCV", "historical");
    timeframeOption = self.safeDict(self.options, "timeframes", defaultValue = Dict{Symbol, Any}());
    contractTimeframes = self.safeDict(timeframeOption, "contract", defaultValue = Dict{Symbol, Any}());
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(contractTimeframes, timeframe, timeframe)
    );
    priceType = safeStringUpper(params, "price");
    params = omit(params, ["historical", "until", "price"]);
    response = nothing;
    if functions.ccxtruthy(limit != nothing)
        limit = min(limit, 1000);
    end
    if functions.ccxtruthy(historical)
        if functions.ccxtruthy(priceType != nothing)
            request[Symbol("priceType")] = priceType;
        end
        startTime = since;
        endTime = until;
        if functions.ccxtruthy(@functions.ccxt_or((since == nothing), (until == nothing)))
            now = milliseconds();
            duration = self.parseTimeframe(timeframe) * 1000;
            numberOfCandles = functions.ccxtruthy(limit) ? limit : maxHistoricalLimit;
            timeDelta = numberOfCandles * duration;
            if functions.ccxtruthy(@functions.ccxt_and((since == nothing), (until == nothing)))
                endTime = now;
                startTime = now - timeDelta;
            elseif functions.ccxtruthy(since == nothing)
                if functions.ccxtruthy(until == nothing)
                    throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a since or until argument")));
                end
                startTime = until - timeDelta;
            else
                endTime = since + timeDelta;
            end
        end
        request[Symbol("startTime")] = startTime;
        request[Symbol("endTime")] = endTime;
        response = Base.fetch(self.contractGetCapiV3MarketHistoryKlines(extend(request, params)));
    else
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        if functions.ccxtruthy(priceType == "MARK")
            response = Base.fetch(self.contractGetCapiV3MarketMarkPriceKlines(extend(request, params)));
        elseif functions.ccxtruthy(priceType == "INDEX")
            response = Base.fetch(self.contractGetCapiV3MarketIndexPriceKlines(extend(request, params)));
        else
            response = Base.fetch(self.contractGetCapiV3MarketKlines(extend(request, params)));
        end
    end
    return self.parseOHLCVs(toArray(response), market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Weex, ohlcv; market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
"""
get the list of most recent trades for a particular symbol
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetTradeData // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetRecentTrades // contract

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (default 100, max 1000)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Weex, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.publicGetApiV3MarketTrades(extend(request, params)));
    else
        response = Base.fetch(self.contractGetCapiV3MarketTrades(extend(request, params)));
    end
    responseList = [];
    if functions.ccxtruthy(response != nothing)
        responseList = toArray(response);
    end
    return self.parseTrades(responseList, market = market, since = since, limit = limit)

end
function parseTrade(self::Weex, trade; market=nothing)
    timestamp = safeInteger(trade, "time");
    isBuyer = self.safeBool(trade, "isBuyer");
    side = safeStringLower(trade, "side");
    isBuyerMaker = self.safeBool(trade, "isBuyerMaker");
    if functions.ccxtruthy(isBuyer != nothing)
        side = functions.ccxtruthy(isBuyer) ? "buy" : "sell";
    elseif functions.ccxtruthy(isBuyerMaker != nothing)
        side = functions.ccxtruthy(isBuyerMaker) ? "sell" : "buy";
    end
    isSpot = true;
    if functions.ccxtruthy(market == nothing)
        marketId = safeString(trade, "symbol");
        realizedPnl = safeString(trade, "realizedPnl");
        marketType = functions.ccxtruthy((realizedPnl != nothing)) ? "swap" : "spot";
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = marketType);
        isSpot = marketType == "spot";
    else
        isSpot = get(market, Symbol("spot"), nothing);
    end
    fee = nothing;
    commission = safeString(trade, "commission");
    if functions.ccxtruthy(commission != nothing)
        commissionAsset = safeString(trade, "commissionAsset");
        feeCurrency = self.safeCurrencyCode(commissionAsset);
        if functions.ccxtruthy(isSpot)
            if functions.ccxtruthy(side == "buy")
                feeCurrency = get(market, Symbol("base"), nothing);
            else
                feeCurrency = get(market, Symbol("quote"), nothing);
            end
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => commission,
            Symbol("currency") => feeCurrency
        );
    end
    isMaker = self.safeBool(trade, "maker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    elseif functions.ccxtruthy(isBuyerMaker != nothing)
        takerOrMaker = "taker";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString(trade, "id"),
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "qty"),
    Symbol("cost") => safeString(trade, "quoteQty"),
    Symbol("fee") => fee
), market = market)

end
"""
retrieves the open interest of a contract trading pair
see: https://www.weex.com/api-doc/contract/Market_API/GetOpenInterest

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Weex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractGetCapiV3MarketOpenInterest(extend(request, params)));
    return self.parseOpenInterest(response, market = market)

end
function parseOpenInterest(self::Weex, interest; market=nothing)
    marketId = safeString(interest, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap");
    timestamp = safeInteger(interest, "time");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("openInterestAmount") => safeString(interest, "openInterest"),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
fetch the funding rate for multiple markets
see: https://www.weex.com/api-doc/contract/Market_API/GetCurrentFundingRate

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
function fetchFundingRates(self::Weex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    symbolsLength = 0;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbolsLength == 1)
        market = self.getMarketFromSymbols(symbols = symbols);
        request[Symbol("symbol")] = safeString(market, "id");
    end
    response = Base.fetch(self.contractGetCapiV3MarketPremiumIndex(extend(request, params)));
    return self.parseFundingRates(response, symbols = symbols)

end
function parseFundingRate(self::Weex, contract; market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap");
    timestamp = safeInteger(contract, "time");
    nextFundingTimestamp = safeInteger(contract, "nextFundingTime");
    interval = nothing;
    collectCycle = safeString(contract, "collectCycle");
    if functions.ccxtruthy(collectCycle != nothing)
        interval = stringDiv(collectCycle, "60");
        interval = string(interval, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => self.safeNumber(contract, "markPrice"),
    Symbol("indexPrice") => self.safeNumber(contract, "indexPrice"),
    Symbol("interestRate") => self.safeNumber(contract, "interestRate"),
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(contract, "lastFundingRate"),
    Symbol("fundingTimestamp") => timestamp,
    Symbol("fundingDatetime") => self.iso8601(timestamp),
    Symbol("nextFundingRate") => self.safeNumber(contract, "forecastFundingRate"),
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => interval
)

end
"""
fetches historical funding rate prices
see: https://www.weex.com/api-doc/contract/Market_API/GetFundingRateHistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of funding rate records to fetch (default 100, max 1000)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Weex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.contractGetCapiV3MarketFundingRate(extend(request, params)));
    return self.parseFundingRateHistories(response, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Weex, contract; market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap");
    timestamp = safeInteger(contract, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
query for balance and get the amount of funds available for trading or funds locked in positions
see: https://www.weex.com/api-doc/spot/AccountAPI/GetAccountBalance // spot
see: https://www.weex.com/api-doc/contract/Account_API/GetAccountBalance // contract
see: https://www.weex.com/api-doc/contract/demo/GetAccountBalance // contract in sandbox mode

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' (default is 'spot', in sandbox mode only 'swap' is available and is used by default)

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Weex; params=Dict())
    requestedType = safeString(params, "type");
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    if functions.ccxtruthy(@functions.ccxt_and(sandboxMode, (requestedType == nothing)))
        type_var = "swap";
    end
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(sandboxMode)
            throw(NotSupported(string(self.id, " fetchBalance() only supports the swap account in sandbox mode, use params[\"type\"] = \"swap\"")));
        end
        response = Base.fetch(self.privateGetApiV3Account(params));
    else
        if functions.ccxtruthy(sandboxMode)
            response = Base.fetch(self.contractPrivateGetCapiV3SimBalance(params));
        else
            response = Base.fetch(self.contractPrivateGetCapiV3AccountBalance(params));
        end
    end
    return self.parseBalance(response)

end
function parseBalance(self::Weex, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    balances = self.safeList(response, "balances", defaultValue = response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = self.safeDict(balances, i);
        currencyId = safeString(entry, "asset");
        if functions.ccxtruthy(@functions.ccxt_and(sandboxMode, (currencyId == "SUSDT")))
            currencyId = "USDT";
        end
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString2(entry, "availableBalance", "free");
        account[Symbol("used")] = safeString2(entry, "frozen", "locked");
        account[Symbol("total")] = safeString(entry, "balance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
fetch a history of internal transfers made on an account
see: https://www.weex.com/api-doc/spot/AccountAPI/TransferRecords

# Arguments
- `code`::string, optional: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve (default 10, max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Weex; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTransfers", symbol = code, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("after")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("before", request, params);
    response = Base.fetch(self.privateGetApiV3AccountTransferRecords(extend(request, params)));
    return self.parseTransfers(response, currency = currency, since = since, limit = limit)

end
function parseTransfer(self::Weex, transfer; currency=nothing)
    timestamp = safeInteger(transfer, "tradeTime");
    currencyId = safeString(transfer, "coinName");
    currencyCode = self.safeCurrencyCode(currencyId, currency = currency);
    status = safeString(transfer, "status");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => currencyCode,
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => safeStringLower(transfer, "fromType"),
    Symbol("toAccount") => safeStringLower(transfer, "toType"),
    Symbol("status") => self.parseTransferStatus(status)
)

end
function parseTransferStatus(self::Weex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Successful") => "ok"
    );
    return safeString(statuses, status, status)

end
"""
Create an order on the exchange
see: https://www.weex.com/api-doc/spot/orderApi/PlaceOrder // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder // contract
see: https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder // contract trigger
see: https://www.weex.com/api-doc/contract/Transaction_API/PlaceTpSlOrder // contract take profit / stop loss
see: https://www.weex.com/api-doc/contract/demo/PlaceOrder // contract in sandbox mode

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint Check createSpotOrder() and createContractOrder() for more details on the extra parameters that can be used in params

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Weex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            return Base.fetch(self.createContractOrder(symbol, type_var, side, amount, price = price, params = params))
    else
        sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
        if functions.ccxtruthy(sandboxMode)
            throw(NotSupported(string(self.id, " createOrder() only supports swap markets in sandbox mode")));
        end
        return Base.fetch(self.createSpotOrder(symbol, type_var, side, amount, price = price, params = params))
    end

end
"""
helper method for creating spot orders
see: https://www.weex.com/api-doc/spot/orderApi/PlaceOrder

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id
- `params.timeInForce`::string, optional: 'GTC', 'IOC', or 'FOK'

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createSpotOrder(self::Weex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createSpotOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = Base.fetch(self.privatePostApiV3Order(request));
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseOrder() returned empty response")));
    end
    return self.parseOrder(response, market = market)

end
function createSpotOrderRequest(self::Weex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createSpotOrderRequest() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("type") => uppercase(type_var),
        Symbol("quantity") => self.amountToPrecision(symbol, amount)
    );
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    clientOrderId = safeString(params, "clientOrderId");
    params = omit(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        partner = safeString(params, "partner", "b-WEEX111125");
        clientOrderId = string(partner, "-", uuid22());
    end
    request[Symbol("newClientOrderId")] = clientOrderId;
    return extend(request, params)

end
"""
helper method for creating contract orders
see: https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder
see: https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder
see: https://www.weex.com/api-doc/contract/demo/PlaceOrder // sandbox mode

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
- `params.takeProfit.triggerPrice`::float, optional: The price at which the take profit order will be triggered
- `params.takeProfit.triggerPriceType`::string, optional: The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last')
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
- `params.stopLoss.triggerPrice`::float, optional: The price at which the stop loss order will be triggered
- `params.stopLoss.triggerPriceType`::string, optional: The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last')
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.stopLossPriceType`::string, optional: The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last')
- `params.takeProfitPrice`::float, optional: price to trigger take-profit orders
- `params.takeProfitPriceType`::string, optional: The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last')
- `params.reduceOnly`::bool, optional: A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
- `params.timeInForce`::string, optional: GTC, IOC, or FOK (default is GTC for limit orders)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createContractOrder(self::Weex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createContractOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    triggerPrice = safeString(request, "triggerPrice");
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(sandboxMode)
            throw(NotSupported(string(self.id, " createOrder() does not support stopLossPrice or takeProfitPrice orders in sandbox mode")));
        end
        response = Base.fetch(self.contractPrivatePostCapiV3AlgoOrder(request));
    elseif functions.ccxtruthy(sandboxMode)
        response = Base.fetch(self.contractPrivatePostCapiV3SimOrder(request));
    else
        response = Base.fetch(self.contractPrivatePostCapiV3Order(request));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " createOrder() returned empty response")));
    end
    return self.parseOrder(response, market = market)

end
function createContractOrderRequest(self::Weex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createContractOrderRequest() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => self.toSandboxMarketId(market),
        Symbol("side") => uppercase(side),
        Symbol("quantity") => self.amountToPrecision(symbol, amount),
        Symbol("type") => uppercase(type_var)
    );
    isMarketOrder = (type_var == "market");
    if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    (triggerPrice, stopLossPrice, takeProfitPrice, query) = self.handleTriggerPricesAndParams(symbol, params);
    if functions.ccxtruthy(triggerPrice != nothing)
        throw(NotSupported(string(self.id, " createOrder() does not support the triggerPrice parameter")));
    end
    isStopLoss = (stopLossPrice != nothing);
    isTakeProfit = (takeProfitPrice != nothing);
    reduceOnly = self.safeBool(query, "reduceOnly");
    if functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
        reduceOnly = true;
    end
    isReduceOnly = (reduceOnly);
    positionSide = "LONG";
    if functions.ccxtruthy(isReduceOnly)
        if functions.ccxtruthy(side == "buy")
            positionSide = "SHORT";
        end
    elseif functions.ccxtruthy(side == "sell")
        positionSide = "SHORT";
    end
    request[Symbol("positionSide")] = positionSide;
    takeProfit = self.safeDict(params, "takeProfit");
    hasTakeProfit = (takeProfit != nothing);
    stopLoss = self.safeDict(params, "stopLoss");
    hasStopLoss = (stopLoss != nothing);
    timeInForce = safeString(params, "timeInForce");
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        partner = safeString(params, "partner", "b-WEEX111125");
        clientOrderId = string(partner, "-", uuid22());
    end
    callerMethodName = safeString(params, "callerMethodName");
    if functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
        if functions.ccxtruthy(callerMethodName == "createOrders")
            throw(NotSupported(string(self.id, " createOrders() does not support stop loss and take profit orders")));
        end
        if functions.ccxtruthy(timeInForce != nothing)
            throw(BadRequest(string(self.id, " createOrder() cannot use timeInForce parameter with stopLoss and takeProfit orders")));
        end
        if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
            throw(BadRequest(string(self.id, " createOrder() cannot use both stopLossPrice/takeProfitPrice parameters and stopLoss/takeProfit objects in params at the same time")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(isStopLoss, isTakeProfit))
            throw(BadRequest(string(self.id, " createOrder() cannot use both stopLossPrice and takeProfitPrice parameters at the same time")));
        end
        request[Symbol("clientAlgoId")] = clientOrderId;
        orderType = nothing;
        if functions.ccxtruthy(isStopLoss)
            stopLossPriceType = safeString2(params, "stopLossPriceType", "triggerPriceType");
            if functions.ccxtruthy(stopLossPriceType != nothing)
                params[Symbol("SlWorkingType")] = self.encodeTriggerPriceType(stopLossPriceType);
            end
            params[Symbol("triggerPrice")] = self.priceToPrecision(symbol, stopLossPrice);
            if functions.ccxtruthy(isMarketOrder)
                orderType = "STOP_MARKET";
            else
                orderType = "STOP";
            end
        elseif functions.ccxtruthy(isTakeProfit)
            takeProfitPriceType = safeString2(params, "takeProfitPriceType", "triggerPriceType");
            if functions.ccxtruthy(takeProfitPriceType != nothing)
                params[Symbol("TpWorkingType")] = self.encodeTriggerPriceType(takeProfitPriceType);
            end
            params[Symbol("triggerPrice")] = self.priceToPrecision(symbol, takeProfitPrice);
            if functions.ccxtruthy(isMarketOrder)
                orderType = "TAKE_PROFIT_MARKET";
            else
                orderType = "TAKE_PROFIT";
            end
        end
        params[Symbol("type")] = orderType;
    else
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isMarketOrder), timeInForce == nothing))
            request[Symbol("timeInForce")] = "GTC";
        end
        request[Symbol("newClientOrderId")] = clientOrderId;
        if functions.ccxtruthy(hasStopLoss)
            stopLossTriggerPrice = self.safeNumber(stopLoss, "triggerPrice");
            request[Symbol("slTriggerPrice")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
            stopLossPriceType = safeString(stopLoss, "triggerPriceType");
            if functions.ccxtruthy(stopLossPriceType != nothing)
                params[Symbol("SlWorkingType")] = self.encodeTriggerPriceType(stopLossPriceType);
            end
        end
        if functions.ccxtruthy(hasTakeProfit)
            takeProfitTriggerPrice = self.safeNumber(takeProfit, "triggerPrice");
            request[Symbol("tpTriggerPrice")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
            takeProfitPriceType = safeString(takeProfit, "triggerPriceType");
            if functions.ccxtruthy(takeProfitPriceType != nothing)
                params[Symbol("TpWorkingType")] = self.encodeTriggerPriceType(takeProfitPriceType);
            end
        end
    end
    params = omit(params, ["takeProfit", "stopLoss", "stopLossPrice", "takeProfitPrice", "triggerPriceType", "stopLossPriceType", "takeProfitPriceType", "clientOrderId", "callerMethodName"]);
    return extend(request, params)

end
function encodeTriggerPriceType(self::Weex, triggerPriceType)
    types = Dict{Symbol, Any}(
        Symbol("mark") => "MARK_PRICE",
        Symbol("last") => "CONTRACT_PRICE"
    );
    return safeString(types, triggerPriceType, triggerPriceType)

end
"""
cancels an open order
see: https://www.weex.com/api-doc/spot/orderApi/CancelOrder // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/CancelOrder // contract

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' (default is 'spot')
- `params.trigger`::bool, optional: *contract orders only* whether the order to cancel is a trigger order
- `params.clientOrderId`::string, optional: *non-trigger orders only* a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Weex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelOrder", market = market, params = params);
    trigger = self.safeBool(params, "trigger", defaultValue = false);
    if functions.ccxtruthy(@functions.ccxt_and(trigger, id == nothing))
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires an id argument for trigger orders")));
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString(params, "clientOrderId");
    params = omit(params, ["clientOrderId", "trigger"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    elseif functions.ccxtruthy(id == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires an id argument or clientOrderId parameter")));
    else
        request[Symbol("orderId")] = id;
    end
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.privateDeleteApiV3Order(extend(request, params)));
    elseif functions.ccxtruthy(trigger)
        response = Base.fetch(self.contractPrivateDeleteCapiV3AlgoOrder(extend(request, params)));
    else
        response = Base.fetch(self.contractPrivateDeleteCapiV3Order(extend(request, params)));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseOrder() returned empty response")));
    end
    order = self.parseOrder(response, market = market);
    order[Symbol("status")] = "canceled";
    return order

end
"""
cancel all open orders
see: https://www.weex.com/api-doc/spot/orderApi/Cancel-Symbol-Orders // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/CancelAllOrders // contract
see: https://www.weex.com/api-doc/contract/Transaction_API/CancelAllPendingOrders // contract trigger

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.trigger`::bool, optional: *swap only* true for cancelling trigger orders (default is false)

# Returns
- Response from the exchange
"""
function cancelAllOrders(self::Weex; symbol=nothing, params=Dict())
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
    (marketType, params) = self.handleMarketTypeAndParams("cancelAllOrders", market = market, params = params);
    trigger = self.safeBool(params, "trigger", defaultValue = false);
    params = omit(params, "trigger");
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument for spot markets")));
        end
        response = Base.fetch(self.privateDeleteApiV3OpenOrders(extend(request, params)));
    elseif functions.ccxtruthy(trigger)
        response = Base.fetch(self.contractPrivateDeleteCapiV3AlgoOpenOrders(extend(request, params)));
    else
        response = Base.fetch(self.contractPrivateDeleteCapiV3AllOpenOrders(extend(request, params)));
    end
    extendedParams = Dict{Symbol, Any}(
        Symbol("status") => "canceled"
    );
    return self.parseOrders(response, market = market, since = nothing, limit = nothing, params = extendedParams)

end
"""
cancel multiple orders
see: https://www.weex.com/api-doc/spot/orderApi/BulkCancel // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/CancelOrdersBatch // contract

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids (could be an alternative to ids)
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Weex, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrders", market = market, params = params);
    isSpot = (marketType == "spot");
    clientOrderIds = self.safeList(params, "clientOrderIds");
    params = omit(params, "clientOrderIds");
    if functions.ccxtruthy(clientOrderIds != nothing)
        if functions.ccxtruthy(isSpot)
            request[Symbol("origClientOrderIds")] = clientOrderIds;
        else
            request[Symbol("origClientOrderIdList")] = clientOrderIds;
        end
    elseif functions.ccxtruthy(ids != nothing)
        if functions.ccxtruthy(isSpot)
            request[Symbol("orderIds")] = ids;
        else
            request[Symbol("orderIdList")] = ids;
        end
    else
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires an ids argument or clientOrderIds parameter")));
    end
    response = nothing;
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.privateDeleteApiV3OrderBatch(extend(request, params)));
    else
        response = Base.fetch(self.contractPrivateDeleteCapiV3BatchOrders(extend(request, params)));
    end
    ordersResponse = self.safeList(response, "orderList", defaultValue = []);
    extendedParams = Dict{Symbol, Any}(
        Symbol("status") => "canceled"
    );
    return self.parseOrders(ordersResponse, market = market, since = nothing, limit = nothing, params = extendedParams)

end
"""
fetches information on an order made by the user
see: https://www.weex.com/api-doc/spot/orderApi/OrderDetails // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetSingleOrderInfo // contract

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.clientOrderId`::string, optional: *spot only* a unique id for the order, used if id is not provided

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Weex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrder", market = market, params = params);
    isSpot = (marketType == "spot");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_and((id == nothing), !functions.ccxtruthy(isSpot)))
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires an id argument for non-spot markets")));
    end
    clientOrderId = safeString(params, "clientOrderId");
    params = omit(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    elseif functions.ccxtruthy(id == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires an id argument or clientOrderId parameter for spot markets")));
    else
        request[Symbol("orderId")] = id;
    end
    response = nothing;
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.privateGetApiV3Order(extend(request, params)));
    else
        response = Base.fetch(self.contractPrivateGetCapiV3Order(extend(request, params)));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseOrder() returned empty response")));
    end
    return self.parseOrder(response, market = market)

end
"""
fetch all unfilled currently open orders
see: https://www.weex.com/api-doc/spot/orderApi/UnfinishedOrders // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentOrderStatus // contract
see: https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentPendingOrders // contract trigger

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.trigger`::bool, optional: *swap only* whether to fetch trigger orders (default is false)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Weex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market = market, params = params);
    isSpot = (marketType == "spot");
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate", defaultValue = false);
    maxLimit = 100;
    if functions.ccxtruthy(paginate)
        if functions.ccxtruthy(isSpot)
            throw(NotSupported(string(self.id, " fetchOpenOrders() pagination is not supported for spot markets")));
        end
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOpenOrders", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = safeString(market, "id");
    end
    response = nothing;
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.privateGetApiV3OpenOrders(extend(request, params)));
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        (request, params) = self.handleUntilOption("endTime", request, params);
        trigger = self.safeBool(params, "trigger", defaultValue = false);
        if functions.ccxtruthy(trigger)
            params = omit(params, "trigger");
            response = Base.fetch(self.contractPrivateGetCapiV3OpenAlgoOrders(extend(request, params)));
        else
            response = Base.fetch(self.contractPrivateGetCapiV3OpenOrders(extend(request, params)));
        end
    end
    extendedParams = Dict{Symbol, Any}(
        Symbol("status") => "open"
    );
    return self.parseOrders(response, market = market, since = since, limit = limit, params = extendedParams)

end
"""
fetches information on multiple closed orders made by the user
see: https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
see: https://www.weex.com/api-doc/contract/demo/GetOrderHistory // contract in sandbox mode

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Weex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchClosedOrders", market = market, params = params);
    orders = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchClosedOrders() requires a symbol argument for spot markets")));
        end
        orders = Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = nothing, params = params));
    else
        orders = Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params));
    end
    return filterBy(orders, "status", "closed")

end
"""
fetches information on multiple canceled orders made by the user
see: https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
see: https://www.weex.com/api-doc/contract/demo/GetOrderHistory // contract in sandbox mode

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Weex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchCanceledOrders", market = market, params = params);
    orders = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchCanceledOrders() requires a symbol argument for spot markets")));
        end
        orders = Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = nothing, params = params));
    else
        orders = Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params));
    end
    return filterBy(orders, "status", "canceled")

end
"""
fetches information on multiple spot orders made by the user
see: https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in (required for spot orders)
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time, ms
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Weex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " fetchOrders() supports spot markets only")));
    end
    maxLimit = 1000;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOrders", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, maxLimit);
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateGetApiV3AllOrders(extend(request, params)));
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed and canceled orders made by the user
see: https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
see: https://www.weex.com/api-doc/contract/demo/GetOrderHistory // contract in sandbox mode

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in (required for spot orders)
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time, ms
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Weex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchCanceledAndClosedOrders", market = market, params = params);
    if functions.ccxtruthy(marketType == "spot")
        throw(NotSupported(string(self.id, " fetchCanceledAndClosedOrders() does not support spot markets. Use fetchOrders() instead and filter by status \"canceled\" or \"closed\"")));
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchCanceledAndClosedOrders", "paginate", defaultValue = false);
    maxLimit = 1000;
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchCanceledAndClosedOrders", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = self.toSandboxMarketId(market);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(sandboxMode)
        response = Base.fetch(self.contractPrivateGetCapiV3SimOrderHistory(extend(request, params)));
    else
        response = Base.fetch(self.contractPrivateGetCapiV3OrderHistory(extend(request, params)));
    end
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
function parseOrder(self::Weex, order; market=nothing)
    errorCode = safeString(order, "errorCode");
    errorMessage = safeString(order, "errorMsg");
    if functions.ccxtruthy(@functions.ccxt_or((errorCode != nothing), (errorMessage != nothing)))
        self.handleOrderOrPositionError(errorCode, errorMessage, order);
    end
    if functions.ccxtruthy(market == nothing)
        marketId = self.fromSandboxMarketId(safeString(order, "symbol"));
        positionSide = safeString(order, "positionSide");
        marketType = functions.ccxtruthy((positionSide == nothing)) ? "spot" : "swap";
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = marketType);
    end
    timestamp = safeIntegerN(order, ["transactTime", "time", "createTime"]);
    rawStatus = safeStringLower(order, "status");
    triggerPrice = omitZero(safeString2(order, "triggerPrice", "stopPrice"));
    rawType = safeStringUpper2(order, "type", "orderType");
    takeProfitPrice = nothing;
    stopLossPrice = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(rawType == "TAKE_PROFIT_MARKET", rawType == "TAKE_PROFIT"))
        takeProfitPrice = triggerPrice;
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(rawType == "STOP_LOSS", rawType == "STOP"), rawType == "STOP_MARKET"))
        stopLossPrice = triggerPrice;
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeStringN(order, ["orderId", "algoId", "successOrderId"]),
    Symbol("clientOrderId") => safeStringN(order, ["clientOrderId", "origClientOrderId", "clientAlgoId"]),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => self.parseOrderType(rawType),
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => nothing,
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => safeStringLower(order, "side"),
    Symbol("amount") => safeString2(order, "origQty", "quantity"),
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => triggerPrice,
    Symbol("cost") => safeString2(order, "cummulativeQuoteQty", "cumQuote"),
    Symbol("filled") => safeString(order, "executedQty"),
    Symbol("remaining") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => nothing,
    Symbol("status") => self.parseOrderStatus(rawStatus),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(order, "updateTime"),
    Symbol("average") => safeString(order, "avgPrice"),
    Symbol("trades") => nothing,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("info") => order
), market = market)

end
function parseOrderStatus(self::Weex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("new") => "open",
        Symbol("partial_fill") => "closed",
        Symbol("full_fill") => "closed",
        Symbol("filled") => "closed",
        Symbol("cancelled") => "canceled",
        Symbol("canceled") => "canceled",
        Symbol("rejected") => "rejected",
        Symbol("untriggered") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Weex, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LIMIT") => "limit",
        Symbol("MARKET") => "market",
        Symbol("STOP_LOSS") => "limit",
        Symbol("STOP") => "limit",
        Symbol("TAKE_PROFIT") => "limit",
        Symbol("TAKE_PROFIT_MARKET") => "market",
        Symbol("STOP_MARKET") => "market"
    );
    return safeString(types, type_var, type_var)

end
function handleOrderOrPositionError(self::Weex, errorCode, errorMessage, order)
    if functions.ccxtruthy(errorCode == nothing)
        errorCode = "";
    end
    if functions.ccxtruthy(errorMessage == nothing)
        errorMessage = "";
    end
    if functions.ccxtruthy(@functions.ccxt_and((errorCode == ""), (errorMessage == "")))
            return 
    end
    feedback = string(self.id, " ", json(order));
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorMessage, feedback);
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
    self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorMessage, feedback);
    self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), errorCode, feedback);
    throw(InvalidOrder(feedback));

end
"""
fetch all the trades made from a single order
see: https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Weex, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    return Base.fetch(self.fetchMyTrades(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetch all trades made by the user
see: https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Weex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params);
    isSpot = (marketType == "spot");
    if functions.ccxtruthy(@functions.ccxt_and(isSpot, (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument for spot markets")));
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate", defaultValue = false);
    maxLimit = 100;
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = safeString(market, "id");
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = nothing;
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.privateGetApiV3MyTrades(extend(request, params)));
    else
        response = Base.fetch(self.contractPrivateGetCapiV3UserTrades(extend(request, params)));
    end
    responseList = [];
    if functions.ccxtruthy(response != nothing)
        responseList = toArray(response);
    end
    return self.parseTrades(responseList, market = market, since = since, limit = limit)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.weex.com/api-doc/spot/AccountAPI/GetBillRecords // spot
see: https://www.weex.com/api-doc/spot/AccountAPI/GetFundBillRecords // funding
see: https://www.weex.com/api-doc/contract/Account_API/GetContractBills // contract

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined, max is 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry
- `params.type`::string, optional: 'spot', 'funding' or 'swap' (default is 'spot')
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Weex; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate", defaultValue = false);
    maxLimit = 100;
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLedger", symbol = code, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    accountType = nothing;
    (accountType, params) = self.handleMarketTypeAndParams("fetchLedger", market = nothing, params = params);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    accountType = safeString(accountsByType, accountType, accountType);
    request = Dict{Symbol, Any}();
    items = nothing;
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(accountType == "contract")
        if functions.ccxtruthy(currency == nothing)
            throw(ExchangeError(string(self.id, " fetchLedger() could not resolve currency")));
        end
        if functions.ccxtruthy(code != nothing)
            request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        (request, params) = self.handleUntilOption("endTime", request, params);
        contractResponse = Base.fetch(self.contractPrivatePostCapiV3AccountIncome(extend(request, params)));
        items = self.safeList(contractResponse, "items", defaultValue = []);
    elseif functions.ccxtruthy(accountType == "funding")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("pageSize")] = limit;
        end
        (request, params) = self.handleUntilOption("endTime", request, params);
        fundingResponse = Base.fetch(self.privatePostApiV3AccountFundingBills(extend(request, params)));
        items = self.safeList(fundingResponse, "items", defaultValue = []);
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("after")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        (request, params) = self.handleUntilOption("before", request, params);
        billsResponse = Base.fetch(self.privatePostApiV3AccountBills(extend(request, params)));
        items = toArray(billsResponse);
    end
    return self.parseLedger(items, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Weex, item; currency=nothing)
    currencyId = safeString2(item, "coinName", "asset");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    timestamp = safeInteger2(item, "cTime", "time");
    amountRaw = safeString2(item, "deltaAmount", "income");
    after = safeString2(item, "afterAmount", "balance");
    before = stringSub(after, amountRaw);
    amount = self.parseNumber(stringAbs(amountRaw));
    direction = "in";
    if functions.ccxtruthy(amountRaw == nothing)
        throw(ExchangeError(string(self.id, " parseLedgerEntry() missing amountRaw")));
    end
    if functions.ccxtruthy(findfirst("-", amountRaw) !== nothing)
        direction = "out";
    end
    rawType = safeString2(item, "bizType", "incomeType");
    transferReason = safeString(item, "transferReason");
    isContractEntry = (transferReason != nothing);
    if functions.ccxtruthy(isContractEntry)
        if functions.ccxtruthy(@functions.ccxt_or((rawType == "withdraw"), (rawType == "deposit")))
            rawType = "transfer";
        end
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "billId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => self.parseLedgerType(rawType),
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("before") => self.parseNumber(before),
    Symbol("after") => self.parseNumber(after),
    Symbol("status") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.safeNumber2(item, "fees", "fillFee")
    )
), currency = currency)

end
function parseLedgerType(self::Weex, type_var)
    types = Dict{Symbol, Any}(
        Symbol("transfer_in") => "transfer",
        Symbol("transfer_out") => "transfer",
        Symbol("deposit") => "deposit",
        Symbol("withdraw") => "withdrawal",
        Symbol("trade_in") => "trade",
        Symbol("trade_out") => "trade",
        Symbol("position_open_long") => "trade",
        Symbol("position_open_short") => "trade",
        Symbol("position_close_long") => "trade",
        Symbol("position_close_short") => "trade"
    );
    return safeString(types, type_var, type_var)

end
"""
fetch all open positions
see: https://www.weex.com/api-doc/contract/Account_API/GetAllPositions
see: https://www.weex.com/api-doc/contract/demo/GetAllPositions // sandbox mode

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Weex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(sandboxMode)
        response = Base.fetch(self.contractPrivateGetCapiV3SimPositionAllPosition(params));
    else
        response = Base.fetch(self.contractPrivateGetCapiV3AccountPositionAllPosition(params));
    end
    return self.parsePositions(response, symbols = symbols)

end
"""
fetch data on an open position
see: https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Weex, symbol; params=Dict())
    positions = Base.fetch(self.fetchPositionsForSymbol(symbol, params = params));
    return self.safeDict(positions, 0)

end
"""
fetch open positions for a single market fetch all open positions for specific symbol
see: https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsForSymbol(self::Weex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    if functions.ccxtruthy(sandboxMode)
            return Base.fetch(self.fetchPositions(symbols = [get(market, Symbol("symbol"), nothing)], params = params))
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractPrivateGetCapiV3AccountPositionSinglePosition(extend(request, params)));
    return self.parsePositions(response, symbols = [get(market, Symbol("symbol"), nothing)])

end
function parsePosition(self::Weex, position; market=nothing)
    errorMessage = safeString(position, "errorMsg");
    errorCode = safeString(position, "errorCode");
    if functions.ccxtruthy(errorMessage != nothing)
        self.handleOrderOrPositionError(errorCode, errorMessage, position);
    end
    marketId = self.fromSandboxMarketId(safeString2(position, "symbol", "coinId"));
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    timestamp = safeInteger(position, "createdTime");
    marginType = safeString2(position, "marginType", "marginMode");
    marginMode = "cross";
    if functions.ccxtruthy(marginType == "ISOLATED")
        marginMode = "isolated";
    end
    separatedMode = safeString(position, "separatedMode");
    hedged = nothing;
    if functions.ccxtruthy(separatedMode == "COMBINED")
        hedged = false;
    elseif functions.ccxtruthy(separatedMode == "SEPARATED")
        hedged = true;
    end
    notional = safeString(position, "openValue");
    size_var = safeString(position, "size");
    entryPrice = stringDiv(notional, size_var);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => safeString2(position, "id", "positionId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("contracts") => self.parseNumber(size_var),
    Symbol("contractSize") => nothing,
    Symbol("side") => safeStringLower(position, "side"),
    Symbol("notional") => self.parseNumber(notional),
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealizePnl"),
    Symbol("realizedPnl") => nothing,
    Symbol("collateral") => nothing,
    Symbol("entryPrice") => self.parseNumber(entryPrice),
    Symbol("markPrice") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidatePrice"),
    Symbol("marginMode") => marginMode,
    Symbol("hedged") => hedged,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => self.safeNumber(position, "marginSize"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(position, "updatedTime"),
    Symbol("lastPrice") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing,
    Symbol("percentage") => nothing,
    Symbol("info") => position
))

end
"""
closes all open positions for a market type
see: https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function closeAllPositions(self::Weex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.contractPrivatePostCapiV3ClosePositions(params));
    return self.parsePositions(response)

end
"""
closes open positions for a market
see: https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by current exchange
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function closePosition(self::Weex, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractPrivatePostCapiV3ClosePositions(extend(request, params)));
    orders = self.parseOrders(response, market = market);
    return self.safeDict(orders, 0)

end
"""
fetch the trading fees for a contract market
see: https://www.weex.com/api-doc/contract/Account_API/GetCommissionRate // contract

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Weex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " fetchTradingFee() is not supported for spot markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractPrivateGetCapiV3AccountCommissionRate(extend(request, params)));
    return self.parseTradingFee(response, market = market)

end
function parseTradingFee(self::Weex, fee; market=nothing)
    marketId = safeString(fee, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("maker") => self.safeNumber(fee, "makerCommissionRate"),
    Symbol("taker") => self.safeNumber(fee, "takerCommissionRate"),
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
"""
fetches the margin mode of a specific symbol
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginMode(self::Weex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractPrivateGetCapiV3AccountSymbolConfig(extend(request, params)));
    marginMode = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseMarginMode(marginMode, market = market)

end
"""
fetches margin modes the symbols, with symbols=undefined all markets are returned
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbols`::array: unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginModes(self::Weex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.contractPrivateGetCapiV3AccountSymbolConfig(params));
    return self.parseMarginModes(toArray(response), symbols = symbols, symbolKey = "symbol", marketType = "swap")

end
function parseMarginMode(self::Weex, marginMode; market=nothing)
    marketId = safeString(marginMode, "symbol");
    marginType = safeString(marginMode, "marginType");
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
    Symbol("marginMode") => self.parseMarginType(marginType)
)

end
function parseMarginType(self::Weex, marginType)
    marginTypes = Dict{Symbol, Any}(
        Symbol("CROSSED") => "cross",
        Symbol("ISOLATED") => "isolated"
    );
    return safeString(marginTypes, marginType, marginType)

end
"""
set margin mode to 'cross' or 'isolated'
see: https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Weex, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginType") => self.encodeMarginMode(marginMode)
    );
    return Base.fetch(self.contractPrivatePostCapiV3AccountMarginType(extend(request, params)))

end
function encodeMarginMode(self::Weex, marginMode)
    marginTypes = Dict{Symbol, Any}(
        Symbol("cross") => "CROSSED",
        Symbol("isolated") => "ISOLATED"
    );
    result = safeString(marginTypes, marginMode);
    if functions.ccxtruthy(result == nothing)
        throw(ArgumentsRequired(string(self.id, " marginMode must be either cross or isolated")));
    end
    return result

end
"""
fetch the set leverage for a market
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Weex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractPrivateGetCapiV3AccountSymbolConfig(extend(request, params)));
    marginMode = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseLeverage(marginMode, market = market)

end
"""
fetch the set leverage for all markets
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverages(self::Weex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.contractPrivateGetCapiV3AccountSymbolConfig(params));
    return self.parseLeverages(toArray(response), symbols = symbols, symbolKey = "symbol", marketType = "swap")

end
function parseLeverage(self::Weex, leverage; market=nothing)
    marketId = safeString(leverage, "symbol");
    marginType = safeString(leverage, "marginType");
    marginMode = self.parseMarginType(marginType);
    crossLeverage = self.safeNumber(leverage, "crossLeverage");
    longLeverage = self.safeNumber(leverage, "isolatedLongLeverage");
    shortLeverage = self.safeNumber(leverage, "isolatedShortLeverage");
    if functions.ccxtruthy(marginMode == "cross")
        longLeverage = crossLeverage;
        shortLeverage = crossLeverage;
    end
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => longLeverage,
    Symbol("shortLeverage") => shortLeverage
)

end
"""
set the level of leverage for a market
see: https://www.weex.com/api-doc/contract/Account_API/UpdateLeverageTRADE

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' (default is 'cross' if specific leverage parameters are not provided)
- `params.crossLeverage`::float, optional: *cross margin mode only* leverage for cross margin mode when marginMode is 'cross'
- `params.isolatedLongLeverage`::float, optional: *isolated margin mode only* leverage for long positions when marginMode is 'isolated'
- `params.isolatedShortLeverage`::float, optional: *isolated margin mode only* leverage for short positions when marginMode is 'isolated' If specific leverage parameters are not provided the leverage value will be applied to both long and short positions if marginMode is 'isolated' or to cross margin mode if marginMode is 'cross' If marginMode is not provided and specific leverage parameters are not provided too the leverage value will be applied to cross leverage

# Returns
- response from the exchange
"""
function setLeverage(self::Weex, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params = params);
    if functions.ccxtruthy(marginMode != nothing)
        request[Symbol("marginType")] = self.encodeMarginMode(marginMode);
    end
    isolatedLongLeverage = self.safeNumber(params, "isolatedLongLeverage");
    isolatedShortLeverage = self.safeNumber(params, "isolatedShortLeverage");
    crossLeverage = self.safeNumber(params, "crossLeverage");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((isolatedLongLeverage == nothing), (isolatedShortLeverage == nothing)), (crossLeverage == nothing)))
        if functions.ccxtruthy(marginMode == "isolated")
            request[Symbol("isolatedLongLeverage")] = leverage;
            request[Symbol("isolatedShortLeverage")] = leverage;
        else
            request[Symbol("crossLeverage")] = leverage;
        end
    end
    return Base.fetch(self.contractPrivatePostCapiV3AccountLeverage(extend(request, params)))

end
"""
fetchs the position mode, hedged or one way
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
function fetchPositionMode(self::Weex; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractPrivateGetCapiV3AccountSymbolConfig(extend(request, params)));
    entry = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    separatedType = safeString(entry, "separatedType");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("hedged") => (separatedType == "SEPARATED")
)

end
"""
set hedged to true or false for a market
see: https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE

# Arguments
- `hedged`::bool: set to true to use dualSidePosition
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string: 'cross' or 'isolated' (default is 'cross')

# Returns
- response from the exchange
"""
function setPositionMode(self::Weex, hedged; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setPositionMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setPositionMode", params = params);
    if functions.ccxtruthy(marginMode == nothing)
        throw(ArgumentsRequired(string(self.id, " setPositionMode() also sets marginMode, so a marginMode parameter is required")));
    end
    separatedType = functions.ccxtruthy(hedged) ? "SEPARATED" : "COMBINED";
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginType") => self.encodeMarginMode(marginMode),
        Symbol("separatedType") => separatedType
    );
    return Base.fetch(self.contractPrivatePostCapiV3AccountMarginType(extend(request, params)))

end
function modifyMarginHelper(self::Weex, symbol, amount, type_var; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isolatedPositionId = safeStringN(params, ["positionId", "id", "isolatedPositionId"]);
    if functions.ccxtruthy(isolatedPositionId == nothing)
        throw(ArgumentsRequired(string(self.id, " modifyMarginHelper() requires a positionId parameter")));
    end
    params = omit(params, ["positionId", "id"]);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("isolatedPositionId") => isolatedPositionId,
        Symbol("amount") => self.costToPrecision(symbol, amount),
        Symbol("type") => type_var
    );
    parsedType = functions.ccxtruthy((type_var == 1)) ? "add" : "reduce";
    response = Base.fetch(self.contractPrivatePostCapiV3AccountPositionMargin(extend(request, params)));
    return extend(self.parseMarginModification(response, market = market), Dict{Symbol, Any}(
    Symbol("amount") => self.parseNumber(amount),
    Symbol("type") => parsedType
))

end
function parseMarginModification(self::Weex, data; market=nothing)
    msg = safeString(data, "msg");
    status = functions.ccxtruthy((msg == "success")) ? "ok" : "failed";
    timestamp = safeInteger(data, "requestTime");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => safeString(market, "settle"),
    Symbol("status") => status,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
remove margin from a position
see: https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::string: the id of the position to reduce margin from, required

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Weex, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, 2, params = params))

end
"""
add margin
see: https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::string: the id of the position to add margin to, required

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Weex, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, 1, params = params))

end
"""
get the market id to send in a request, converting to the demo-trading market id (e.g. BTCSUSDT) when sandbox mode is enabled, only valid for USDT-margined linear markets which is all the demo environment provides

# Arguments
- `market`::object: a unified market structure

# Returns
- the market id for the request
"""
function toSandboxMarketId(self::Weex, market)
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    baseId = safeString(market, "baseId");
    if functions.ccxtruthy(@functions.ccxt_and(sandboxMode, (baseId != nothing)))
            return string(baseId, "SUSDT")
    end
    return safeString(market, "id")

end
"""
convert a demo-trading market id (e.g. BTCSUSDT) from a response back into the live market id (e.g. BTCUSDT) when sandbox mode is enabled

# Arguments
- `marketId`::string, optional: a market id from an exchange response

# Returns
- the live market id
"""
function fromSandboxMarketId(self::Weex, marketId)
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(sandboxMode), (marketId == nothing)))
            return marketId
    end
    if functions.ccxtruthy(@functions.ccxt_and((self.markets_by_id != nothing), (ccxt_in(marketId, self.markets_by_id))))
            return marketId
    end
    if functions.ccxtruthy(endswith(marketId, "SUSDT"))
        baseLength = length(marketId) - 5;
            return string(functions.ccxt_slice(marketId, 0, baseLength), "USDT")
    end
    return marketId

end
function setSandboxMode(self::Weex, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;

end
function sign(self::Weex, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    endpoint = self.implodeParams(path, params);
    query = omit(params, self.extractParams(path));
    isBatch = (findfirst("batch", path) !== nothing);
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isBatch), (@functions.ccxt_or((method == "GET"), (method == "DELETE")))))
        if functions.ccxtruthy(length(objectKeys(query)))
            endpoint += string("?", self.urlencode(query));
        end
    end
    if functions.ccxtruthy(@functions.ccxt_or((api == "private"), (api == "contractPrivate")))
        sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
        if functions.ccxtruthy(@functions.ccxt_and(sandboxMode, (findfirst("capi/v3/sim/", path) === nothing)))
            throw(NotSupported(string(self.id, " ", path, " is not available in sandbox mode, demo trading only supports fetchBalance, createOrder, fetchPositions, fetchClosedOrders and fetchCanceledOrders for swap markets")));
        end
        self.checkRequiredCredentials();
        timestamp = numberToString(self.nonce());
        payload = string(timestamp, method, "/", endpoint);
        if functions.ccxtruthy(@functions.ccxt_or((method == "POST"), isBatch))
            body = json(query);
            payload += body;
        end
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("ACCESS-KEY") => self.apiKey,
            Symbol("ACCESS-SIGN") => signature,
            Symbol("ACCESS-PASSPHRASE") => self.password,
            Symbol("ACCESS-TIMESTAMP") => timestamp
        );
        if functions.ccxtruthy(@functions.ccxt_or((method == "POST"), (method == "DELETE")))
            headers[Symbol("Content-Type")] = "application/json";
        end
    else
        headers = Dict{Symbol, Any}(
            Symbol("User-Agent") => "ccxt"
        );
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", endpoint);
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Weex, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    message = safeString(response, "msg");
    if functions.ccxtruthy(message != nothing)
        errorCode = safeString(response, "code");
        feedback = string(self.id, " ", body);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        throw(ExchangeError(string(self.id, " ", body)));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Weex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetApiV3Time(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3Coins(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/coins"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3ExchangeInfo(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/exchangeInfo"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3Ping(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/ping"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3ApiTradingSymbols(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/apiTradingSymbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3MarketTickerPrice(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/market/ticker/price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3MarketTicker24hr(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/market/ticker/24hr"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3MarketTrades(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/market/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3MarketKlines(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/market/klines"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3MarketDepth(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/market/depth"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV3MarketTickerBookTicker(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/market/ticker/bookTicker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3Account(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/account/"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3AccountTransferRecords(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/account/transferRecords"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3Order(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3OpenOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/openOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3AllOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/allOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3MyTrades(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/myTrades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3RebateAffiliateGetAffiliateUIDs(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/rebate/affiliate/getAffiliateUIDs"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3RebateAffiliateGetChannelUserTradeAndAsset(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/rebate/affiliate/getChannelUserTradeAndAsset"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3RebateAffiliateGetAffiliateCommission(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/rebate/affiliate/getAffiliateCommission"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3RebateAffiliateGetInternalWithdrawalStatus(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/rebate/affiliate/getInternalWithdrawalStatus"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3RebateAffiliateQuerySubChannelTransactions(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/rebate/affiliate/querySubChannelTransactions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3AgencyVerifyReferrals(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/agency/verifyReferrals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3AgencyGetAssert(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/agency/getAssert"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV3AgencyGetDealData(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/agency/getDealData"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV3AccountBills(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/account/bills"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV3AccountFundingBills(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/account/fundingBills"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV3Order(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV3OrderBatch(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/order/batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV3RebateAffiliateInternalWithdrawal(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/rebate/affiliate/internalWithdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV3Order(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV3OpenOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/openOrders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV3OrderBatch(self::Weex, params=Dict(), context=Dict())
    return request(self, "api/v3/order/batch"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketTime(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/time"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketExchangeInfo(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/exchangeInfo"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketDepth(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/depth"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketTicker24hr(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/ticker/24hr"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketTickerBookTicker(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/ticker/bookTicker"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketTrades(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/trades"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketKlines(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/klines"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketIndexPriceKlines(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/indexPriceKlines"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketMarkPriceKlines(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/markPriceKlines"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketHistoryKlines(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/historyKlines"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketSymbolPrice(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/symbolPrice"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketOpenInterest(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/openInterest"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketPremiumIndex(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/premiumIndex"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketFundingRate(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/fundingRate"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractGetCapiV3MarketApiTradingSymbols(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/market/apiTradingSymbols"; api="contract", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3AccountBalance(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/balance"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3AccountCommissionRate(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/commissionRate"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3AccountAccountConfig(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/accountConfig"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3AccountSymbolConfig(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/symbolConfig"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3AccountPositionAllPosition(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/position/allPosition"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3AccountPositionSinglePosition(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/position/singlePosition"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3Order(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/order"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3OpenOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/openOrders"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3OrderHistory(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/order/history"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3UserTrades(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/userTrades"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3OpenAlgoOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/openAlgoOrders"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3AllAlgoOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/allAlgoOrders"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3SimBalance(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/sim/balance"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3SimPositionAllPosition(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/sim/position/allPosition"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateGetCapiV3SimOrderHistory(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/sim/order/history"; api="contractPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3AccountIncome(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/income"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3AccountMarginType(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/marginType"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3AccountLeverage(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/leverage"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3AccountPositionMargin(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/positionMargin"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3AccountModifyAutoAppendMargin(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/account/modifyAutoAppendMargin"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3Order(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/order"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3BatchOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/batchOrders"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3ClosePositions(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/closePositions"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3AlgoOrder(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/algoOrder"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3PlaceTpSlOrder(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/placeTpSlOrder"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3ModifyTpSlOrder(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/modifyTpSlOrder"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivatePostCapiV3SimOrder(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/sim/order"; api="contractPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateDeleteCapiV3Order(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/order"; api="contractPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateDeleteCapiV3BatchOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/batchOrders"; api="contractPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateDeleteCapiV3AllOpenOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/allOpenOrders"; api="contractPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateDeleteCapiV3AlgoOrder(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/algoOrder"; api="contractPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractPrivateDeleteCapiV3AlgoOpenOrders(self::Weex, params=Dict(), context=Dict())
    return request(self, "capi/v3/algoOpenOrders"; api="contractPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Weex(; kwargs...)
    inst = Weex(Exchange(), describe, nonce, fetchStatus, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, fetchTickers, fetchBidsAsks, parseTicker, fetchLastPrices, parseLastPrice, fetchMarkPrice, fetchMarkPrices, fetchOrderBook, fetchOHLCV, fetchSpotOHLCV, fetchContractOHLCV, parseOHLCV, fetchTrades, parseTrade, fetchOpenInterest, parseOpenInterest, fetchFundingRates, parseFundingRate, fetchFundingRateHistory, parseFundingRateHistory, fetchBalance, parseBalance, fetchTransfers, parseTransfer, parseTransferStatus, createOrder, createSpotOrder, createSpotOrderRequest, createContractOrder, createContractOrderRequest, encodeTriggerPriceType, cancelOrder, cancelAllOrders, cancelOrders, fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrders, fetchCanceledAndClosedOrders, parseOrder, parseOrderStatus, parseOrderType, handleOrderOrPositionError, fetchOrderTrades, fetchMyTrades, fetchLedger, parseLedgerEntry, parseLedgerType, fetchPositions, fetchPosition, fetchPositionsForSymbol, parsePosition, closeAllPositions, closePosition, fetchTradingFee, parseTradingFee, fetchMarginMode, fetchMarginModes, parseMarginMode, parseMarginType, setMarginMode, encodeMarginMode, fetchLeverage, fetchLeverages, parseLeverage, setLeverage, fetchPositionMode, setPositionMode, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, toSandboxMarketId, fromSandboxMarketId, setSandboxMode, sign, handleErrors, publicGetApiV3Time, publicGetApiV3Coins, publicGetApiV3ExchangeInfo, publicGetApiV3Ping, publicGetApiV3ApiTradingSymbols, publicGetApiV3MarketTickerPrice, publicGetApiV3MarketTicker24hr, publicGetApiV3MarketTrades, publicGetApiV3MarketKlines, publicGetApiV3MarketDepth, publicGetApiV3MarketTickerBookTicker, privateGetApiV3Account, privateGetApiV3AccountTransferRecords, privateGetApiV3Order, privateGetApiV3OpenOrders, privateGetApiV3AllOrders, privateGetApiV3MyTrades, privateGetApiV3RebateAffiliateGetAffiliateUIDs, privateGetApiV3RebateAffiliateGetChannelUserTradeAndAsset, privateGetApiV3RebateAffiliateGetAffiliateCommission, privateGetApiV3RebateAffiliateGetInternalWithdrawalStatus, privateGetApiV3RebateAffiliateQuerySubChannelTransactions, privateGetApiV3AgencyVerifyReferrals, privateGetApiV3AgencyGetAssert, privateGetApiV3AgencyGetDealData, privatePostApiV3AccountBills, privatePostApiV3AccountFundingBills, privatePostApiV3Order, privatePostApiV3OrderBatch, privatePostApiV3RebateAffiliateInternalWithdrawal, privateDeleteApiV3Order, privateDeleteApiV3OpenOrders, privateDeleteApiV3OrderBatch, contractGetCapiV3MarketTime, contractGetCapiV3MarketExchangeInfo, contractGetCapiV3MarketDepth, contractGetCapiV3MarketTicker24hr, contractGetCapiV3MarketTickerBookTicker, contractGetCapiV3MarketTrades, contractGetCapiV3MarketKlines, contractGetCapiV3MarketIndexPriceKlines, contractGetCapiV3MarketMarkPriceKlines, contractGetCapiV3MarketHistoryKlines, contractGetCapiV3MarketSymbolPrice, contractGetCapiV3MarketOpenInterest, contractGetCapiV3MarketPremiumIndex, contractGetCapiV3MarketFundingRate, contractGetCapiV3MarketApiTradingSymbols, contractPrivateGetCapiV3AccountBalance, contractPrivateGetCapiV3AccountCommissionRate, contractPrivateGetCapiV3AccountAccountConfig, contractPrivateGetCapiV3AccountSymbolConfig, contractPrivateGetCapiV3AccountPositionAllPosition, contractPrivateGetCapiV3AccountPositionSinglePosition, contractPrivateGetCapiV3Order, contractPrivateGetCapiV3OpenOrders, contractPrivateGetCapiV3OrderHistory, contractPrivateGetCapiV3UserTrades, contractPrivateGetCapiV3OpenAlgoOrders, contractPrivateGetCapiV3AllAlgoOrders, contractPrivateGetCapiV3SimBalance, contractPrivateGetCapiV3SimPositionAllPosition, contractPrivateGetCapiV3SimOrderHistory, contractPrivatePostCapiV3AccountIncome, contractPrivatePostCapiV3AccountMarginType, contractPrivatePostCapiV3AccountLeverage, contractPrivatePostCapiV3AccountPositionMargin, contractPrivatePostCapiV3AccountModifyAutoAppendMargin, contractPrivatePostCapiV3Order, contractPrivatePostCapiV3BatchOrders, contractPrivatePostCapiV3ClosePositions, contractPrivatePostCapiV3AlgoOrder, contractPrivatePostCapiV3PlaceTpSlOrder, contractPrivatePostCapiV3ModifyTpSlOrder, contractPrivatePostCapiV3SimOrder, contractPrivateDeleteCapiV3Order, contractPrivateDeleteCapiV3BatchOrders, contractPrivateDeleteCapiV3AllOpenOrders, contractPrivateDeleteCapiV3AlgoOrder, contractPrivateDeleteCapiV3AlgoOpenOrders)
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
function __ccxt_doc_Weex_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://www.weex.com/api-doc/spot/ConfigAPI/Ping

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Weex_fetchStatus

function __ccxt_doc_Weex_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://www.weex.com/api-doc/spot/ConfigAPI/GetServerTime
see: https://www.weex.com/api-doc/contract/Market_API/GetServerTime

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', default is 'spot'

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Weex_fetchTime

function __ccxt_doc_Weex_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://www.weex.com/api-doc/spot/ConfigAPI/CurrencyInfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Weex_fetchCurrencies

function __ccxt_doc_Weex_fetchMarkets() end
"""
retrieves data on all markets for exchagne
see: https://www.weex.com/api-doc/spot/ConfigAPI/GetProductInfo // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetContractInfo // contract

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Weex_fetchMarkets

function __ccxt_doc_Weex_fetchTickers() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetAllTickerInfo // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetTicker24h // contract

# Arguments
- `symbols`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', default is 'spot' (used if symbols are not provided)

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Weex_fetchTickers

function __ccxt_doc_Weex_fetchBidsAsks() end
"""
fetches the bid and ask price and volume for multiple markets
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetBookTicker // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetBookTicker // contract

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', default is 'spot' (used if symbols are not provided)

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Weex_fetchBidsAsks

function __ccxt_doc_Weex_fetchLastPrices() end
"""
fetches the last price for multiple markets
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetTickerInfo

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the last prices for, all spot markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of lastprice structures
"""
__ccxt_doc_Weex_fetchLastPrices

function __ccxt_doc_Weex_fetchMarkPrice() end
"""
fetches mark price for the market
see: https://www.weex.com/api-doc/contract/Market_API/GetSymbolPrice

# Arguments
- `symbol`::string: unified symbol of the market to fetch the mark price for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.priceType`::string, optional: "MARK" (default) or "INDEX", with "INDEX" the price is returned as the indexPrice of the ticker

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Weex_fetchMarkPrice

function __ccxt_doc_Weex_fetchMarkPrices() end
"""
fetches mark prices for multiple markets
see: https://www.weex.com/api-doc/contract/Market_API/GetCurrentFundingRate

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the mark prices for, all contract markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Weex_fetchMarkPrices

function __ccxt_doc_Weex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetDepthData // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetDepthData // contract

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return (default 15, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Weex_fetchOrderBook

function __ccxt_doc_Weex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
see: https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
see: https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
see: https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch (default 100, max 300)
- `params`::object, optional: extra parameters specific to the exchange API endpoint Check fetchSpotOHLCV() and fetchContractOHLCV() for more details on the extra parameters that can be used in params

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Weex_fetchOHLCV

function __ccxt_doc_Weex_fetchSpotOHLCV() end
"""
helper method for fetchOHLCV
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Weex_fetchSpotOHLCV

function __ccxt_doc_Weex_fetchContractOHLCV() end
"""
helper method for fetchOHLCV
see: https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
see: https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
see: https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
see: https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch (default 100, max 100 for historical klines, max 1000 for other contract klines)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: whether to automatically paginate requests until the required number of candles is returned
- `params.historical`::bool, optional: whether to fetch historical klines (default is false). If false, will fetch last price klines

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Weex_fetchContractOHLCV

function __ccxt_doc_Weex_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://www.weex.com/api-doc/spot/MarketDataAPI/GetTradeData // spot
see: https://www.weex.com/api-doc/contract/Market_API/GetRecentTrades // contract

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (default 100, max 1000)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Weex_fetchTrades

function __ccxt_doc_Weex_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair
see: https://www.weex.com/api-doc/contract/Market_API/GetOpenInterest

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Weex_fetchOpenInterest

function __ccxt_doc_Weex_fetchFundingRates() end
"""
fetch the funding rate for multiple markets
see: https://www.weex.com/api-doc/contract/Market_API/GetCurrentFundingRate

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
__ccxt_doc_Weex_fetchFundingRates

function __ccxt_doc_Weex_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://www.weex.com/api-doc/contract/Market_API/GetFundingRateHistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of funding rate records to fetch (default 100, max 1000)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Weex_fetchFundingRateHistory

function __ccxt_doc_Weex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in positions
see: https://www.weex.com/api-doc/spot/AccountAPI/GetAccountBalance // spot
see: https://www.weex.com/api-doc/contract/Account_API/GetAccountBalance // contract
see: https://www.weex.com/api-doc/contract/demo/GetAccountBalance // contract in sandbox mode

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' (default is 'spot', in sandbox mode only 'swap' is available and is used by default)

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Weex_fetchBalance

function __ccxt_doc_Weex_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://www.weex.com/api-doc/spot/AccountAPI/TransferRecords

# Arguments
- `code`::string, optional: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve (default 10, max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Weex_fetchTransfers

function __ccxt_doc_Weex_createOrder() end
"""
Create an order on the exchange
see: https://www.weex.com/api-doc/spot/orderApi/PlaceOrder // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder // contract
see: https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder // contract trigger
see: https://www.weex.com/api-doc/contract/Transaction_API/PlaceTpSlOrder // contract take profit / stop loss
see: https://www.weex.com/api-doc/contract/demo/PlaceOrder // contract in sandbox mode

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint Check createSpotOrder() and createContractOrder() for more details on the extra parameters that can be used in params

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_createOrder

function __ccxt_doc_Weex_createSpotOrder() end
"""
helper method for creating spot orders
see: https://www.weex.com/api-doc/spot/orderApi/PlaceOrder

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id
- `params.timeInForce`::string, optional: 'GTC', 'IOC', or 'FOK'

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_createSpotOrder

function __ccxt_doc_Weex_createContractOrder() end
"""
helper method for creating contract orders
see: https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder
see: https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder
see: https://www.weex.com/api-doc/contract/demo/PlaceOrder // sandbox mode

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
- `params.takeProfit.triggerPrice`::float, optional: The price at which the take profit order will be triggered
- `params.takeProfit.triggerPriceType`::string, optional: The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last')
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
- `params.stopLoss.triggerPrice`::float, optional: The price at which the stop loss order will be triggered
- `params.stopLoss.triggerPriceType`::string, optional: The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last')
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.stopLossPriceType`::string, optional: The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last')
- `params.takeProfitPrice`::float, optional: price to trigger take-profit orders
- `params.takeProfitPriceType`::string, optional: The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last')
- `params.reduceOnly`::bool, optional: A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
- `params.timeInForce`::string, optional: GTC, IOC, or FOK (default is GTC for limit orders)

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_createContractOrder

function __ccxt_doc_Weex_cancelOrder() end
"""
cancels an open order
see: https://www.weex.com/api-doc/spot/orderApi/CancelOrder // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/CancelOrder // contract

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' (default is 'spot')
- `params.trigger`::bool, optional: *contract orders only* whether the order to cancel is a trigger order
- `params.clientOrderId`::string, optional: *non-trigger orders only* a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_cancelOrder

function __ccxt_doc_Weex_cancelAllOrders() end
"""
cancel all open orders
see: https://www.weex.com/api-doc/spot/orderApi/Cancel-Symbol-Orders // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/CancelAllOrders // contract
see: https://www.weex.com/api-doc/contract/Transaction_API/CancelAllPendingOrders // contract trigger

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.trigger`::bool, optional: *swap only* true for cancelling trigger orders (default is false)

# Returns
- Response from the exchange
"""
__ccxt_doc_Weex_cancelAllOrders

function __ccxt_doc_Weex_cancelOrders() end
"""
cancel multiple orders
see: https://www.weex.com/api-doc/spot/orderApi/BulkCancel // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/CancelOrdersBatch // contract

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids (could be an alternative to ids)
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_cancelOrders

function __ccxt_doc_Weex_fetchOrder() end
"""
fetches information on an order made by the user
see: https://www.weex.com/api-doc/spot/orderApi/OrderDetails // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetSingleOrderInfo // contract

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.clientOrderId`::string, optional: *spot only* a unique id for the order, used if id is not provided

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_fetchOrder

function __ccxt_doc_Weex_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://www.weex.com/api-doc/spot/orderApi/UnfinishedOrders // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentOrderStatus // contract
see: https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentPendingOrders // contract trigger

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.trigger`::bool, optional: *swap only* whether to fetch trigger orders (default is false)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_fetchOpenOrders

function __ccxt_doc_Weex_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
see: https://www.weex.com/api-doc/contract/demo/GetOrderHistory // contract in sandbox mode

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_fetchClosedOrders

function __ccxt_doc_Weex_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
see: https://www.weex.com/api-doc/contract/demo/GetOrderHistory // contract in sandbox mode

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_fetchCanceledOrders

function __ccxt_doc_Weex_fetchOrders() end
"""
fetches information on multiple spot orders made by the user
see: https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in (required for spot orders)
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time, ms
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_fetchOrders

function __ccxt_doc_Weex_fetchCanceledAndClosedOrders() end
"""
fetches information on multiple closed and canceled orders made by the user
see: https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
see: https://www.weex.com/api-doc/contract/demo/GetOrderHistory // contract in sandbox mode

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in (required for spot orders)
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::object, optional: end time, ms
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_fetchCanceledAndClosedOrders

function __ccxt_doc_Weex_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Weex_fetchOrderTrades

function __ccxt_doc_Weex_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
see: https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Weex_fetchMyTrades

function __ccxt_doc_Weex_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.weex.com/api-doc/spot/AccountAPI/GetBillRecords // spot
see: https://www.weex.com/api-doc/spot/AccountAPI/GetFundBillRecords // funding
see: https://www.weex.com/api-doc/contract/Account_API/GetContractBills // contract

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined, max is 100
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry
- `params.type`::string, optional: 'spot', 'funding' or 'swap' (default is 'spot')
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Weex_fetchLedger

function __ccxt_doc_Weex_fetchPositions() end
"""
fetch all open positions
see: https://www.weex.com/api-doc/contract/Account_API/GetAllPositions
see: https://www.weex.com/api-doc/contract/demo/GetAllPositions // sandbox mode

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Weex_fetchPositions

function __ccxt_doc_Weex_fetchPosition() end
"""
fetch data on an open position
see: https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Weex_fetchPosition

function __ccxt_doc_Weex_fetchPositionsForSymbol() end
"""
fetch open positions for a single market fetch all open positions for specific symbol
see: https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Weex_fetchPositionsForSymbol

function __ccxt_doc_Weex_closeAllPositions() end
"""
closes all open positions for a market type
see: https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Weex_closeAllPositions

function __ccxt_doc_Weex_closePosition() end
"""
closes open positions for a market
see: https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by current exchange
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Weex_closePosition

function __ccxt_doc_Weex_fetchTradingFee() end
"""
fetch the trading fees for a contract market
see: https://www.weex.com/api-doc/contract/Account_API/GetCommissionRate // contract

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Weex_fetchTradingFee

function __ccxt_doc_Weex_fetchMarginMode() end
"""
fetches the margin mode of a specific symbol
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Weex_fetchMarginMode

function __ccxt_doc_Weex_fetchMarginModes() end
"""
fetches margin modes the symbols, with symbols=undefined all markets are returned
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbols`::array: unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Weex_fetchMarginModes

function __ccxt_doc_Weex_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Weex_setMarginMode

function __ccxt_doc_Weex_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Weex_fetchLeverage

function __ccxt_doc_Weex_fetchLeverages() end
"""
fetch the set leverage for all markets
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Weex_fetchLeverages

function __ccxt_doc_Weex_setLeverage() end
"""
set the level of leverage for a market
see: https://www.weex.com/api-doc/contract/Account_API/UpdateLeverageTRADE

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' (default is 'cross' if specific leverage parameters are not provided)
- `params.crossLeverage`::float, optional: *cross margin mode only* leverage for cross margin mode when marginMode is 'cross'
- `params.isolatedLongLeverage`::float, optional: *isolated margin mode only* leverage for long positions when marginMode is 'isolated'
- `params.isolatedShortLeverage`::float, optional: *isolated margin mode only* leverage for short positions when marginMode is 'isolated' If specific leverage parameters are not provided the leverage value will be applied to both long and short positions if marginMode is 'isolated' or to cross margin mode if marginMode is 'cross' If marginMode is not provided and specific leverage parameters are not provided too the leverage value will be applied to cross leverage

# Returns
- response from the exchange
"""
__ccxt_doc_Weex_setLeverage

function __ccxt_doc_Weex_fetchPositionMode() end
"""
fetchs the position mode, hedged or one way
see: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
__ccxt_doc_Weex_fetchPositionMode

function __ccxt_doc_Weex_setPositionMode() end
"""
set hedged to true or false for a market
see: https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE

# Arguments
- `hedged`::bool: set to true to use dualSidePosition
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string: 'cross' or 'isolated' (default is 'cross')

# Returns
- response from the exchange
"""
__ccxt_doc_Weex_setPositionMode

function __ccxt_doc_Weex_reduceMargin() end
"""
remove margin from a position
see: https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::string: the id of the position to reduce margin from, required

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Weex_reduceMargin

function __ccxt_doc_Weex_addMargin() end
"""
add margin
see: https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::string: the id of the position to add margin to, required

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Weex_addMargin

function __ccxt_doc_Weex_toSandboxMarketId() end
"""
get the market id to send in a request, converting to the demo-trading market id (e.g. BTCSUSDT) when sandbox mode is enabled, only valid for USDT-margined linear markets which is all the demo environment provides

# Arguments
- `market`::object: a unified market structure

# Returns
- the market id for the request
"""
__ccxt_doc_Weex_toSandboxMarketId

function __ccxt_doc_Weex_fromSandboxMarketId() end
"""
convert a demo-trading market id (e.g. BTCSUSDT) from a response back into the live market id (e.g. BTCUSDT) when sandbox mode is enabled

# Arguments
- `marketId`::string, optional: a market id from an exchange response

# Returns
- the live market id
"""
__ccxt_doc_Weex_fromSandboxMarketId
