@kwdef mutable struct Mexc <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchSwapMarkets::Function = fetchSwapMarkets
    fetchOrderBook::Function = fetchOrderBook
    parseOrderBookBidAsk::Function = parseOrderBookBidAsk
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchBidsAsks::Function = fetchBidsAsks
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    createOrder::Function = createOrder
    createSpotOrderRequest::Function = createSpotOrderRequest
    createSpotOrder::Function = createSpotOrder
    createSwapOrder::Function = createSwapOrder
    createOrders::Function = createOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOrdersByIds::Function = fetchOrdersByIds
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchOrdersByState::Function = fetchOrdersByState
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    parseOrder::Function = parseOrder
    parseOrderSide::Function = parseOrderSide
    parseOrderType::Function = parseOrderType
    parseOrderStatus::Function = parseOrderStatus
    parseOrderTimeInForce::Function = parseOrderTimeInForce
    getTifFromRawOrderType::Function = getTifFromRawOrderType
    fetchAccountHelper::Function = fetchAccountHelper
    fetchAccounts::Function = fetchAccounts
    fetchTradingFee::Function = fetchTradingFee
    customParseBalance::Function = customParseBalance
    parseBalanceHelper::Function = parseBalanceHelper
    fetchBalance::Function = fetchBalance
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderTrades::Function = fetchOrderTrades
    modifyMarginHelper::Function = modifyMarginHelper
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    setLeverage::Function = setLeverage
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingRate::Function = parseFundingRate
    fetchFundingInterval::Function = fetchFundingInterval
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatusByType::Function = parseTransactionStatusByType
    closeAllPositions::Function = closeAllPositions
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchTransfer::Function = fetchTransfer
    fetchTransfers::Function = fetchTransfers
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseAccountId::Function = parseAccountId
    parseTransferStatus::Function = parseTransferStatus
    withdraw::Function = withdraw
    setPositionMode::Function = setPositionMode
    fetchPositionMode::Function = fetchPositionMode
    fetchTransactionFees::Function = fetchTransactionFees
    parseTransactionFees::Function = parseTransactionFees
    parseTransactionFee::Function = parseTransactionFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    handleMarginModeAndParams::Function = handleMarginModeAndParams
    fetchPositionsHistory::Function = fetchPositionsHistory
    setMarginMode::Function = setMarginMode
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
end
function describe(self::Mexc, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "mexc",
    Symbol("name") => "MEXC Global",
    Symbol("countries") => ["SC"],
    Symbol("rateLimit") => 50,
    Symbol("version") => "v3",
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
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
        Symbol("closeAllPositions") => true,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createMarketSellOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("deposit") => nothing,
        Symbol("editOrder") => nothing,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
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
        Symbol("fetchFundingInterval") => true,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchL2OrderBook") => true,
        Symbol("fetchLedger") => nothing,
        Symbol("fetchLedgerEntry") => nothing,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => false,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => nothing,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => nothing,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => "emulated",
        Symbol("fetchPositionHistory") => "emulated",
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPositionsRisk") => nothing,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => nothing,
        Symbol("fetchTransactionFee") => "emulated",
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchTransactions") => nothing,
        Symbol("fetchTransfer") => true,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawal") => nothing,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => nothing,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("public") => "https://api.mexc.com",
                Symbol("private") => "https://api.mexc.com"
            ),
            Symbol("spot2") => Dict{Symbol, Any}(
                Symbol("public") => "https://www.mexc.com/open/api/v2",
                Symbol("private") => "https://www.mexc.com/open/api/v2"
            ),
            Symbol("contract") => Dict{Symbol, Any}(
                Symbol("public") => "https://api.mexc.com/api/v1/contract",
                Symbol("private") => "https://api.mexc.com/api/v1/private"
            ),
            Symbol("broker") => Dict{Symbol, Any}(
                Symbol("private") => "https://api.mexc.com/api/v3/broker"
            )
        ),
        Symbol("www") => "https://www.mexc.com/",
        Symbol("doc") => ["https://www.mexc.com/api-docs/spot-v3/introduction", "https://www.mexc.com/api-docs/futures/integration-guide"],
        Symbol("fees") => ["https://www.mexc.com/fee"],
        Symbol("referral") => "https://www.mexc.com/register?inviteCode=mexc-1FQ1GNu1"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("defaultSymbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("symbol/offline") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                    Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                    Symbol("historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("aggTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("avgPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                    Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("etf/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("kyc/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("uid") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                    Symbol("allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("strategy/group") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("strategy/group/uid") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("tradeFee") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("sub-account/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/apiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/config/getall") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("capital/deposit/hisrec") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("capital/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/withdraw/address") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("capital/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("capital/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/transfer/tranId") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/transfer/internal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/sub-account/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/convert") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/convert/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/loan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/maxTransferable") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/priceIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/isolated/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/maxBorrowable") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/isolated/pair") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/forceLiquidationRec") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/isolatedMarginData") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/isolatedMarginTier") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/taxQuery") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/detail/kickback") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/referCode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/affiliate/commission") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/affiliate/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/affiliate/commission/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/affiliate/campaign") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/affiliate/referral") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/affiliate/subaffiliates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/affiliate/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mxDeduct/enable") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("selfSymbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/internal/transfer/record") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("apiKeyInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/virtualSubAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/apiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("strategy/group") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("capital/withdraw/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                    Symbol("capital/transfer/internal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/sub-account/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/convert") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("mxDeduct/enable") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/apiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("strategy/group") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("strategy/group/uid") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("contract") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("detail") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                    Symbol("support_currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("depth/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("depth_commits/{symbol}/{limit}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("index_price/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("fair_price/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("funding_rate/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("kline/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("kline/index_price/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("kline/fair_price/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("deals/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("risk_reverse") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("risk_reverse/history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("funding_rate/history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/transfer_record") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/profit_rate/{type}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset/analysis/{type}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/feeDeductConfigs") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset/analysis/yesterday_pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset/analysis/today_pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/config/contractFeeDiscountConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/fee_details") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/discountType") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset/analysis/export") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset_book/order_deal_fee/total") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/contract/fee_rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/contract/zero_fee_rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/list/history_positions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/open_positions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/funding_records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/position_mode") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/list/open_orders/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/list/open_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/list/history_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/list/order_deals/v3") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/external/{symbol}/{external_oid}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/get/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/batch_query") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("order/deal_details/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/list/order_deals") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/list/close_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("planorder/list/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("stoporder/list/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("stoporder/open_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("stoporder/order_details/{stop_order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/risk_limit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/tiered_fee_rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/tiered_fee_rate/v2") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("trackorder/list/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("market_maker/self_trade/blacklist") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("market_maker/self_trade/blacklist/search") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("account/asset/analysis/v3") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset/analysis/calendar/daily/v3") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset/analysis/calendar/monthly/v3") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/asset/analysis/recent/v3") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/change_margin") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/change_auto_add_im") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/change_leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/change_position_mode") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/reverse") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("position/close_all") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/submit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/submit_batch") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/chase_limit_order") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/change_limit_order") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/batch_cancel_with_external") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/cancel_with_external") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/cancel_all") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/open_order_total_count") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("order/batch_query_with_external") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("account/change_risk_level") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("planorder/place") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("planorder/place/v2") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("planorder/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("planorder/cancel_all") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("planorder/change_stop_order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("stoporder/place") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("stoporder/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("stoporder/cancel_all") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("stoporder/change_price") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("stoporder/change_plan_price") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("trackorder/place") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("trackorder/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("trackorder/change_order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("market_maker/self_trade/blacklist/create") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("market_maker/self_trade/blacklist/update") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("market_maker/self_trade/blacklist/delete") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            )
        ),
        Symbol("spot2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("market/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/coin/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("common/timestamp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("common/ping") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/api_default_symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/open_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/query") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/deal_detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/deposit/address/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("asset/deposit/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("asset/address/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("asset/withdraw/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("asset/internal/transfer/record") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("asset/internal/transfer/info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("market/api_symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("order/place") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/place_batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/advanced/place_batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("asset/internal/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/cancel_by_symbol") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            )
        ),
        Symbol("broker") => Dict{Symbol, Any}(
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("sub-account/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/apiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/deposit/subAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/deposit/subHisrec") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/deposit/subHisrec/getall") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("rebate/taxQuery") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("sub-account/virtualSubAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/apiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/deposit/subAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("capital/withdraw/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub-account/futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("sub-account/apiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("4h") => "4h",
        Symbol("8h") => "8h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("taker") => self.parseNumber("0.002")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("adjustForTimeDifference") => false,
        Symbol("timeDifference") => 0,
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => Dict{Symbol, Any}(
                Symbol("spot") => true,
                Symbol("swap") => Dict{Symbol, Any}(
                    Symbol("linear") => true,
                    Symbol("inverse") => false
                )
            )
        ),
        Symbol("useCcxtTradeId") => true,
        Symbol("timeframes") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("1m") => "1m",
                Symbol("5m") => "5m",
                Symbol("15m") => "15m",
                Symbol("30m") => "30m",
                Symbol("1h") => "60m",
                Symbol("4h") => "4h",
                Symbol("1d") => "1d",
                Symbol("1w") => "1W",
                Symbol("1M") => "1M"
            ),
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("1m") => "Min1",
                Symbol("5m") => "Min5",
                Symbol("15m") => "Min15",
                Symbol("30m") => "Min30",
                Symbol("1h") => "Min60",
                Symbol("4h") => "Hour4",
                Symbol("8h") => "Hour8",
                Symbol("1d") => "Day1",
                Symbol("1w") => "Week1",
                Symbol("1M") => "Month1"
            )
        ),
        Symbol("defaultType") => "spot",
        Symbol("defaultNetwork") => "ETH",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ETH",
            Symbol("USDT") => "ERC20",
            Symbol("USDC") => "ERC20",
            Symbol("BTC") => "BTC",
            Symbol("LTC") => "LTC"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ZKSYNC") => "ZKSYNCERA",
            Symbol("TRC20") => "TRX",
            Symbol("TON") => "TONCOIN",
            Symbol("ARBITRUM") => "ARB",
            Symbol("STX") => "STACKS",
            Symbol("LUNC") => "LUNA",
            Symbol("STARK") => "STARKNET",
            Symbol("APT") => "APTOS",
            Symbol("PEAQ") => "PEAQEVM",
            Symbol("AVAXC") => "AVAX_CCHAIN",
            Symbol("ERC20") => "ETH",
            Symbol("ACA") => "ACALA",
            Symbol("BEP20") => "BSC",
            Symbol("OPTIMISM") => "OP",
            Symbol("ASTR") => "ASTAR",
            Symbol("BTM") => "BTM2",
            Symbol("CRC20") => "CRONOS",
            Symbol("DOT") => "DOTASSETHUB",
            Symbol("ETHF") => "ETF",
            Symbol("HRC20") => "HECO",
            Symbol("OASIS") => "ROSE",
            Symbol("OKC") => "OKT",
            Symbol("RSK") => "RBTC"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("BNB Smart Chain(BEP20-RACAV1)") => "BSC",
            Symbol("BNB Smart Chain(BEP20-RACAV2)") => "BSC",
            Symbol("BNB Smart Chain(BEP20)") => "BSC",
            Symbol("Ethereum(ERC20)") => "ERC20"
        ),
        Symbol("recvWindow") => 5 * 1000,
        Symbol("maxTimeTillEnd") => 90 * 86400 * 1000 - 1,
        Symbol("broker") => "CCXT"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => false,
                Symbol("triggerDirection") => false,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => false,
                    Symbol("mark") => false,
                    Symbol("index") => false
                ),
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => true,
                Symbol("trailing") => false,
                Symbol("leverage") => true,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 20
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 30,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 7,
                Symbol("untilDays") => 7,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 7,
                Symbol("daysBackCanceled") => 7,
                Symbol("untilDays") => 7,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("fetchCurrencies") => Dict{Symbol, Any}(
                Symbol("private") => true
            )
        ),
        Symbol("forDerivs") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true
                ),
                Symbol("triggerDirection") => true,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("hedged") => true,
                Symbol("leverage") => true,
                Symbol("marketBuyByCost") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 90
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => true,
                Symbol("trailing") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 90,
                Symbol("trigger") => true,
                Symbol("trailing") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 90,
                Symbol("trigger") => true,
                Symbol("trailing") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 2000
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
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("BEYONDPROTOCOL") => "BEYOND",
        Symbol("BIFI") => "BIFIF",
        Symbol("BYN") => "BEYONDFI",
        Symbol("COFI") => "COFIX",
        Symbol("DFI") => "DFISTARTER",
        Symbol("DFT") => "DFUTURE",
        Symbol("DRK") => "DRK",
        Symbol("EGC") => "EGORASCREDIT",
        Symbol("FLUX1") => "FLUX",
        Symbol("FLUX") => "FLUX1",
        Symbol("FREE") => "FREEROSSDAO",
        Symbol("GAS") => "GASDAO",
        Symbol("GASNEO") => "GAS",
        Symbol("GMT") => "GMTTOKEN",
        Symbol("STEPN") => "GMT",
        Symbol("HERO") => "STEPHERO",
        Symbol("MIMO") => "MIMOSA",
        Symbol("PROS") => "PROSFINANCE",
        Symbol("SIN") => "SINCITYTOKEN",
        Symbol("SOUL") => "SOULSWAP",
        Symbol("XBT") => "XBT"
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-1128") => BadRequest,
            Symbol("-2011") => BadRequest,
            Symbol("-1121") => BadSymbol,
            Symbol("401") => AuthenticationError,
            Symbol("402") => AuthenticationError,
            Symbol("403") => PermissionDenied,
            Symbol("406") => PermissionDenied,
            Symbol("429") => RateLimitExceeded,
            Symbol("500") => ExchangeError,
            Symbol("501") => ExchangeNotAvailable,
            Symbol("503") => ExchangeNotAvailable,
            Symbol("504") => RequestTimeout,
            Symbol("510") => RateLimitExceeded,
            Symbol("511") => PermissionDenied,
            Symbol("513") => BadRequest,
            Symbol("601") => BadRequest,
            Symbol("603") => BadRequest,
            Symbol("604") => OnMaintenance,
            Symbol("701") => PermissionDenied,
            Symbol("702") => PermissionDenied,
            Symbol("703") => PermissionDenied,
            Symbol("704") => PermissionDenied,
            Symbol("801") => OnMaintenance,
            Symbol("1000") => AuthenticationError,
            Symbol("1001") => BadSymbol,
            Symbol("10101") => InsufficientFunds,
            Symbol("2009") => InvalidOrder,
            Symbol("2011") => BadRequest,
            Symbol("30004") => InsufficientFunds,
            Symbol("33333") => BadRequest,
            Symbol("44444") => BadRequest,
            Symbol("1002") => InvalidOrder,
            Symbol("30019") => BadRequest,
            Symbol("30005") => InvalidOrder,
            Symbol("2003") => InvalidOrder,
            Symbol("2005") => InsufficientFunds,
            Symbol("400") => BadRequest,
            Symbol("600") => BadRequest,
            Symbol("70011") => PermissionDenied,
            Symbol("88004") => InsufficientFunds,
            Symbol("88009") => ExchangeError,
            Symbol("88013") => InvalidOrder,
            Symbol("88015") => InsufficientFunds,
            Symbol("700003") => InvalidNonce,
            Symbol("26") => ExchangeError,
            Symbol("602") => AuthenticationError,
            Symbol("10001") => AuthenticationError,
            Symbol("10007") => BadSymbol,
            Symbol("10015") => BadRequest,
            Symbol("10072") => BadRequest,
            Symbol("10073") => BadRequest,
            Symbol("10095") => InvalidOrder,
            Symbol("10096") => InvalidOrder,
            Symbol("10097") => InvalidOrder,
            Symbol("10098") => InvalidOrder,
            Symbol("10099") => BadRequest,
            Symbol("10100") => BadRequest,
            Symbol("10102") => InvalidOrder,
            Symbol("10103") => ExchangeError,
            Symbol("10200") => BadRequest,
            Symbol("10201") => BadRequest,
            Symbol("10202") => BadRequest,
            Symbol("10206") => BadRequest,
            Symbol("10211") => BadRequest,
            Symbol("10212") => BadRequest,
            Symbol("10216") => ExchangeError,
            Symbol("10219") => ExchangeError,
            Symbol("10222") => BadRequest,
            Symbol("10232") => BadRequest,
            Symbol("10259") => ExchangeError,
            Symbol("10265") => ExchangeError,
            Symbol("10268") => BadRequest,
            Symbol("11444") => OnMaintenance,
            Symbol("20001") => ExchangeError,
            Symbol("20002") => ExchangeError,
            Symbol("22222") => BadRequest,
            Symbol("30000") => ExchangeError,
            Symbol("30001") => InvalidOrder,
            Symbol("30002") => InvalidOrder,
            Symbol("30003") => InvalidOrder,
            Symbol("30010") => InvalidOrder,
            Symbol("30014") => InvalidOrder,
            Symbol("30016") => InvalidOrder,
            Symbol("30018") => AccountSuspended,
            Symbol("30020") => AuthenticationError,
            Symbol("30021") => BadRequest,
            Symbol("30025") => InvalidOrder,
            Symbol("30026") => BadRequest,
            Symbol("30027") => InvalidOrder,
            Symbol("30028") => InvalidOrder,
            Symbol("30029") => InvalidOrder,
            Symbol("30032") => InvalidOrder,
            Symbol("30041") => InvalidOrder,
            Symbol("30087") => InvalidOrder,
            Symbol("60005") => ExchangeError,
            Symbol("700001") => AuthenticationError,
            Symbol("700002") => AuthenticationError,
            Symbol("700004") => BadRequest,
            Symbol("700005") => InvalidNonce,
            Symbol("700006") => BadRequest,
            Symbol("700007") => AuthenticationError,
            Symbol("700008") => BadRequest,
            Symbol("700013") => AuthenticationError,
            Symbol("730001") => BadRequest,
            Symbol("730002") => BadRequest,
            Symbol("730000") => ExchangeError,
            Symbol("730003") => ExchangeError,
            Symbol("730100") => ExchangeError,
            Symbol("730600") => BadRequest,
            Symbol("730601") => BadRequest,
            Symbol("730602") => BadRequest,
            Symbol("730700") => BadRequest,
            Symbol("730701") => BadRequest,
            Symbol("730702") => BadRequest,
            Symbol("730703") => BadRequest,
            Symbol("730704") => BadRequest,
            Symbol("730705") => BadRequest,
            Symbol("730706") => BadRequest,
            Symbol("730707") => BadRequest,
            Symbol("730101") => BadRequest,
            Symbol("140001") => BadRequest,
            Symbol("140002") => AuthenticationError
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Order quantity error, please try to modify.") => BadRequest,
            Symbol("Combination of optional parameters invalid") => BadRequest,
            Symbol("api market order is disabled") => BadRequest,
            Symbol("Contract not allow place order!") => InvalidOrder,
            Symbol("Oversold") => InsufficientFunds,
            Symbol("Insufficient position") => InsufficientFunds,
            Symbol("Insufficient balance!") => InsufficientFunds,
            Symbol("Bid price is great than max allow price") => InvalidOrder,
            Symbol("Invalid symbol.") => BadSymbol,
            Symbol("Param error!") => BadRequest,
            Symbol("maintenance") => OnMaintenance
        )
    )
))

end
function fetchStatus(self::Mexc, params=Dict())
    (marketType, query) = self.handleMarketTypeAndParams("fetchStatus", nothing, params);
    response = Dict{Symbol, Any}();
    status = nothing;
    updated = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.spotPublicGetPing(query));
        keys_var = objectKeys(response);
        len = length(keys_var);
        status = functions.ccxtruthy(len) ? json(response) : "ok";
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.contractPublicGetPing(query));
        status = functions.ccxtruthy(safeValue(response, "success")) ? "ok" : json(response);
        updated = safeInteger(response, "data");
    end
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("url") => nothing,
    Symbol("eta") => nothing,
    Symbol("info") => response
)

end
function fetchTime(self::Mexc, params=Dict())
    (marketType, query) = self.handleMarketTypeAndParams("fetchTime", nothing, params);
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.spotPublicGetTime(query));
            return safeInteger(response, "serverTime")
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.contractPublicGetPing(query));
        return safeInteger(response, "data")
    end
    return nothing

end
function fetchCurrencies(self::Mexc, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(self.checkRequiredCredentials(false)))
            return Dict{Symbol, Any}()
    end
    response = Base.fetch(self.spotPrivateGetCapitalConfigGetall(params));
    return self.parseCurrencies(response)

end
function parseCurrency(self::Mexc, rawCurrency)
    id = safeString(rawCurrency, "coin");
    code = self.safeCurrencyCode(id);
    networks = Dict{Symbol, Any}();
    chains = safeValue(rawCurrency, "networkList", []);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString2(chain, "netWork", "network");
        network = self.networkIdToCode(networkId, code);
        if functions.ccxtruthy(network != nothing)
            networks[Symbol(network)] = Dict{Symbol, Any}(
                Symbol("info") => chain,
                Symbol("id") => networkId,
                Symbol("network") => network,
                Symbol("active") => nothing,
                Symbol("deposit") => self.safeBool(chain, "depositEnable", false),
                Symbol("withdraw") => self.safeBool(chain, "withdrawEnable", false),
                Symbol("fee") => self.safeNumber(chain, "withdrawFee"),
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => safeString(chain, "withdrawMin"),
                        Symbol("max") => safeString(chain, "withdrawMax")
                    )
                ),
                Symbol("contract") => safeString(chain, "contract")
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => safeString(rawCurrency, "name"),
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
    Symbol("type") => "crypto",
    Symbol("networks") => networks
))

end
function fetchMarkets(self::Mexc, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    spotMarketPromise = self.fetchSpotMarkets(params);
    swapMarketPromise = self.fetchSwapMarkets(params);
    (spotMarket, swapMarket) = (Base.fetch(asyncmap(Base.fetch, [spotMarketPromise, swapMarketPromise])));
    return arrayConcat(spotMarket, swapMarket)

end
function fetchSpotMarkets(self::Mexc, params=Dict())
    response = Base.fetch(self.spotPublicGetExchangeInfo(params));
    data = safeValue(response, "symbols", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        market = get(data, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseAsset");
        quoteId = safeString(market, "quoteAsset");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        status = safeString(market, "status");
        isSpotTradingAllowed = safeValue(market, "isSpotTradingAllowed");
        active = false;
        if functions.ccxtruthy(@functions.ccxt_and((status == "1"), (isSpotTradingAllowed)))
            active = true;
        end
        isMarginTradingAllowed = safeValue(market, "isMarginTradingAllowed");
        makerCommission = self.safeNumber(market, "makerCommission");
        takerCommission = self.safeNumber(market, "takerCommission");
        maxQuoteAmount = self.safeNumber(market, "maxQuoteAmount");
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
    Symbol("margin") => isMarginTradingAllowed,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => takerCommission,
    Symbol("maker") => makerCommission,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "baseAssetPrecision"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "quoteAssetPrecision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "baseSizePrecision"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quoteAmountPrecision"),
            Symbol("max") => maxQuoteAmount
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function fetchSwapMarkets(self::Mexc, params=Dict())
    currentRl = self.rateLimit;
    self.setProperty(self, "rateLimit", 10);
    response = Base.fetch(self.contractPublicGetDetail(params));
    self.setProperty(self, "rateLimit", currentRl);
    data = safeValue(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        market = get(data, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseCoin");
        quoteId = safeString(market, "quoteCoin");
        settleId = safeString(market, "settleCoin");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        state = safeString(market, "state");
        isLinear = quote_var == settle;
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var, ":", settle),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => (state == "0"),
    Symbol("contract") => true,
    Symbol("linear") => isLinear,
    Symbol("inverse") => !functions.ccxtruthy(isLinear),
    Symbol("taker") => self.safeNumber(market, "takerFeeRate"),
    Symbol("maker") => self.safeNumber(market, "makerFeeRate"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "volUnit"),
        Symbol("price") => self.safeNumber(market, "priceUnit")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minLeverage"),
            Symbol("max") => self.safeNumber(market, "maxLeverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minVol"),
            Symbol("max") => self.safeNumber(market, "maxVol")
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
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function fetchOrderBook(self::Mexc, symbol, limit=nothing, params=Dict())
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
    orderbook = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.spotPublicGetDepth(extend(request, params)));
        spotTimestamp = safeInteger(response, "timestamp");
        orderbook = self.parseOrderBook(response, symbol, spotTimestamp);
        orderbook[Symbol("nonce")] = safeInteger(response, "lastUpdateId");
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.contractPublicGetDepthSymbol(extend(request, params)));
        data = safeValue(response, "data");
        timestamp = safeInteger(data, "timestamp");
        orderbook = self.parseOrderBook(data, symbol, timestamp);
        orderbook[Symbol("nonce")] = safeInteger(data, "version");
    end
    return orderbook

end
function parseOrderBookBidAsk(self::Mexc, bidask, priceKey=0, amountKey=1, countOrIdKey=2)
    countKey = 2;
    price = self.safeNumber(bidask, priceKey);
    amount = self.safeNumber(bidask, amountKey);
    count_var = self.safeNumber(bidask, countKey);
    if functions.ccxtruthy(count_var != nothing)
            return [price, amount, count_var]
    end
    return [price, amount]

end
function fetchTrades(self::Mexc, symbol, since=nothing, limit=nothing, params=Dict())
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
    trades = [];
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        until = safeInteger2(params, "endTime", "until");
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
            if functions.ccxtruthy(until == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchTrades() requires an until parameter when since is provided")));
            end
        end
        if functions.ccxtruthy(until != nothing)
            if functions.ccxtruthy(since == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchTrades() requires a since parameter when until is provided")));
            end
            request[Symbol("endTime")] = until;
        end
        method = safeString(self.options, "fetchTradesMethod", "spotPublicGetAggTrades");
        method = safeString(params, "method", method);
        params = omit(params, ["method"]);
        if functions.ccxtruthy(method == "spotPublicGetAggTrades")
            trades = Base.fetch(self.spotPublicGetAggTrades(extend(request, params)));
        elseif functions.ccxtruthy(method == "spotPublicGetHistoricalTrades")
            trades = Base.fetch(self.spotPublicGetHistoricalTrades(extend(request, params)));
        else
            if functions.ccxtruthy(method == "spotPublicGetTrades")
                trades = Base.fetch(self.spotPublicGetTrades(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchTrades() not support this method")));
            end

        end
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.contractPublicGetDealsSymbol(extend(request, params)));
        trades = self.safeList(response, "data", []);
    end
    return self.parseTrades(trades, market, since, limit)

end
function parseTrade(self::Mexc, trade, market=nothing)
    id = nothing;
    timestamp = nothing;
    orderId = nothing;
    symbol = nothing;
    fee = nothing;
    type_var = nothing;
    side = nothing;
    takerOrMaker = nothing;
    priceString = nothing;
    amountString = nothing;
    costString = nothing;
    if functions.ccxtruthy(ccxt_in("v", trade))
        timestamp = safeInteger(trade, "t");
        market = self.safeMarket(nothing, market);
        symbol = get(market, Symbol("symbol"), nothing);
        priceString = safeString(trade, "p");
        amountString = safeString(trade, "v");
        side = self.parseOrderSide(safeString(trade, "T"));
        takerOrMaker = "taker";
    else
        marketId = safeString(trade, "symbol");
        market = self.safeMarket(marketId, market);
        symbol = get(market, Symbol("symbol"), nothing);
        id = safeString2(trade, "id", "a");
        priceString = safeString2(trade, "price", "p");
        orderId = safeString(trade, "orderId");
        if functions.ccxtruthy(ccxt_in("positionMode", trade))
            timestamp = safeInteger(trade, "timestamp");
            amountString = safeString(trade, "vol");
            side = self.parseOrderSide(safeString(trade, "side"));
            fee = Dict{Symbol, Any}(
                Symbol("cost") => safeString(trade, "fee"),
                Symbol("currency") => self.safeCurrencyCode(safeString(trade, "feeCurrency"))
            );
            takerOrMaker = functions.ccxtruthy(safeValue(trade, "taker")) ? "taker" : "maker";
        else
            timestamp = safeInteger2(trade, "time", "T");
            amountString = safeString2(trade, "qty", "q");
            costString = safeString(trade, "quoteQty");
            isBuyer = safeValue(trade, "isBuyer");
            isMaker = safeValue(trade, "isMaker");
            buyerMaker = safeValue2(trade, "isBuyerMaker", "m");
            if functions.ccxtruthy(isMaker != nothing)
                takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
            end
            if functions.ccxtruthy(isBuyer != nothing)
                side = functions.ccxtruthy(isBuyer) ? "buy" : "sell";
            end
            if functions.ccxtruthy(buyerMaker != nothing)
                side = functions.ccxtruthy(buyerMaker) ? "sell" : "buy";
                takerOrMaker = "taker";
            end
            feeAsset = safeString(trade, "commissionAsset");
            if functions.ccxtruthy(feeAsset != nothing)
                fee = Dict{Symbol, Any}(
                    Symbol("cost") => safeString(trade, "commission"),
                    Symbol("currency") => self.safeCurrencyCode(feeAsset)
                );
            end
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(id == nothing, self.safeBool(self.options, "useCcxtTradeId", true)))
        id = self.createCcxtTradeId(timestamp, side, amountString, priceString, takerOrMaker);
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee,
    Symbol("info") => trade
), market)

end
function fetchOHLCV(self::Mexc, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    maxLimit = functions.ccxtruthy((get(market, Symbol("spot"), nothing))) ? 500 : 2000;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, maxLimit))
    end
    options = safeValue(self.options, "timeframes", Dict{Symbol, Any}());
    timeframes = safeValue(options, get(market, Symbol("type"), nothing), Dict{Symbol, Any}());
    timeframeValue = safeString(timeframes, timeframe);
    duration = self.parseTimeframe(timeframe) * 1000;
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => timeframeValue
    );
    candles = [];
    until = safeInteger2(params, "until", "endTime");
    start = since;
    if functions.ccxtruthy(@functions.ccxt_and((until != nothing), (since == nothing)))
        params = omit(params, ["until"]);
        usedLimit = functions.ccxtruthy(limit) ? limit : maxLimit;
        start = until - (usedLimit * duration);
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(start != nothing)
            request[Symbol("startTime")] = start;
            if functions.ccxtruthy(until == nothing)
                end_var = self.sum(since, maxLimit * duration);
                now = milliseconds();
                request[Symbol("endTime")] = min(end_var, now);
            end
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        if functions.ccxtruthy(until != nothing)
            request[Symbol("endTime")] = until + 1;
        end
        response = Base.fetch(self.spotPublicGetKlines(extend(request, params)));
        candles = toArray(response);
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start")] = self.parseToInt(since / 1000);
        end
        if functions.ccxtruthy(until != nothing)
            request[Symbol("end")] = self.parseToInt(until / 1000);
            if functions.ccxtruthy(since == nothing)
                request[Symbol("start")] = self.parseToInt(start / 1000);
            end
        end
        priceType = safeString(params, "price", "default");
        params = omit(params, "price");
        if functions.ccxtruthy(priceType == "default")
            response = Base.fetch(self.contractPublicGetKlineSymbol(extend(request, params)));
        elseif functions.ccxtruthy(priceType == "index")
            response = Base.fetch(self.contractPublicGetKlineIndexPriceSymbol(extend(request, params)));
        else
            if functions.ccxtruthy(priceType == "mark")
                response = Base.fetch(self.contractPublicGetKlineFairPriceSymbol(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchOHLCV() not support this price type, [default, index, mark]")));
            end

        end
        data = safeValue(response, "data");
        candles = self.convertTradingViewToOHLCV(data, "time", "open", "high", "low", "close", "vol");
    end
    return self.parseOHLCVs(candles, market, timeframe, since, limit)

end
function parseOHLCV(self::Mexc, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchTickers(self::Mexc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    isSingularMarket = false;
    if functions.ccxtruthy(symbols != nothing)
        len = length(symbols);
        isSingularMarket = len == 1;
        firstSymbol = safeString(symbols, 0);
        market = self.market(firstSymbol);
    end
    (marketType, query) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    tickers = nothing;
    if functions.ccxtruthy(isSingularMarket)
        request[Symbol("symbol")] = safeString(market, "id");
    end
    if functions.ccxtruthy(marketType == "spot")
        tickers = Base.fetch(self.spotPublicGetTicker24hr(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.contractPublicGetTicker(extend(request, query)));
        tickers = safeValue(response, "data", []);
    end
    if functions.ccxtruthy(isSingularMarket)
        tickers = [tickers];
    end
    return self.parseTickers(tickers, symbols)

end
function fetchTicker(self::Mexc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (marketType, query) = self.handleMarketTypeAndParams("fetchTicker", market, params);
    ticker = nothing;
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(marketType == "spot")
        ticker = Base.fetch(self.spotPublicGetTicker24hr(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.contractPublicGetTicker(extend(request, query)));
        ticker = safeValue(response, "data", Dict{Symbol, Any}());
    end
    return self.parseTicker(ticker, market)

end
function parseTicker(self::Mexc, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId, market);
    timestamp = nothing;
    bid = nothing;
    ask = nothing;
    bidVolume = nothing;
    askVolume = nothing;
    baseVolume = nothing;
    quoteVolume = nothing;
    open = nothing;
    high = nothing;
    low = nothing;
    changePcnt = nothing;
    changeValue = nothing;
    prevClose = nothing;
    isSwap = safeValue(market, "swap");
    if functions.ccxtruthy(@functions.ccxt_or(isSwap, (ccxt_in("timestamp", ticker))))
        timestamp = safeInteger(ticker, "timestamp");
        bid = safeString(ticker, "bid1");
        ask = safeString(ticker, "ask1");
        baseVolume = safeString(ticker, "volume24");
        quoteVolume = safeString(ticker, "amount24");
        high = safeString(ticker, "high24Price");
        low = safeString(ticker, "lower24Price");
        changeValue = safeString(ticker, "riseFallValue");
        changePcnt = safeString(ticker, "riseFallRate");
        changePcnt = stringMul(changePcnt, "100");
    else
        timestamp = safeInteger(ticker, "closeTime");
        bid = safeString(ticker, "bidPrice");
        ask = safeString(ticker, "askPrice");
        bidVolume = safeString(ticker, "bidQty");
        askVolume = safeString(ticker, "askQty");
        if functions.ccxtruthy(stringEq(bidVolume, "0"))
            bidVolume = nothing;
        end
        if functions.ccxtruthy(stringEq(askVolume, "0"))
            askVolume = nothing;
        end
        baseVolume = safeString(ticker, "volume");
        quoteVolume = safeString(ticker, "quoteVolume");
        open = safeString(ticker, "openPrice");
        high = safeString(ticker, "highPrice");
        low = safeString(ticker, "lowPrice");
        prevClose = safeString(ticker, "prevClosePrice");
        changeValue = safeString(ticker, "priceChange");
        changePcnt = safeString(ticker, "priceChangePercent");
        changePcnt = stringMul(changePcnt, "100");
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("open") => open,
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("close") => safeString(ticker, "lastPrice"),
    Symbol("bid") => bid,
    Symbol("bidVolume") => bidVolume,
    Symbol("ask") => ask,
    Symbol("askVolume") => askVolume,
    Symbol("vwap") => nothing,
    Symbol("previousClose") => prevClose,
    Symbol("change") => changeValue,
    Symbol("percentage") => changePcnt,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchBidsAsks(self::Mexc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    isSingularMarket = false;
    if functions.ccxtruthy(symbols != nothing)
        len = length(symbols);
        isSingularMarket = len == 1;
        market = self.market(get(symbols, 1, nothing));
    end
    (marketType, query) = self.handleMarketTypeAndParams("fetchBidsAsks", market, params);
    tickers = nothing;
    if functions.ccxtruthy(marketType == "spot")
        tickers = Base.fetch(self.spotPublicGetTickerBookTicker(query));
    elseif functions.ccxtruthy(marketType == "swap")
        throw(NotSupported(string(self.id, " fetchBidsAsks() is not available for ", marketType, " markets")));
    end
    if functions.ccxtruthy(isSingularMarket)
        tickers = [tickers];
    end
    return self.parseTickers(tickers, symbols)

end
function createMarketBuyOrderWithCost(self::Mexc, symbol, cost, params=Dict())
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
    return Base.fetch(self.createOrder(symbol, "market", "buy", 0, nothing, extend(req, params)))

end
function createMarketSellOrderWithCost(self::Mexc, symbol, cost, params=Dict())
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
    return Base.fetch(self.createOrder(symbol, "market", "sell", 0, nothing, extend(req, params)))

end
function createOrder(self::Mexc, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (marginMode, query) = self.handleMarginModeAndParams("createOrder", params);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return Base.fetch(self.createSpotOrder(market, type_var, side, amount, price, marginMode, query))
    else
        return Base.fetch(self.createSwapOrder(market, type_var, side, amount, price, marginMode, query))
    end

end
function createSpotOrderRequest(self::Mexc, market, type_var, side, amount, price=nothing, marginMode=nothing, params=Dict())
    symbol = get(market, Symbol("symbol"), nothing);
    orderSide = uppercase(side);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => orderSide,
        Symbol("type") => uppercase(type_var)
    );
    if functions.ccxtruthy(type_var == "market")
        cost = self.safeNumber2(params, "cost", "quoteOrderQty");
        params = omit(params, "cost");
        if functions.ccxtruthy(cost != nothing)
            amount = cost;
            request[Symbol("quoteOrderQty")] = self.costToPrecision(symbol, amount);
        else
            if functions.ccxtruthy(price == nothing)
                request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
            else
                amountString = numberToString(amount);
                priceString = numberToString(price);
                quoteAmount = stringMul(amountString, priceString);
                amount = quoteAmount;
                request[Symbol("quoteOrderQty")] = self.costToPrecision(symbol, amount);
            end
        end
    else
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("newClientOrderId")] = clientOrderId;
        params = omit(params, ["type", "clientOrderId"]);
    end
    if functions.ccxtruthy(marginMode != nothing)
        if functions.ccxtruthy(marginMode != "isolated")
            throw(BadRequest(string(self.id, " createOrder() does not support marginMode ", marginMode, " for spot-margin trading")));
        end
    end
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(type_var == "market", type_var == "LIMIT_MAKER", params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("type")] = "LIMIT_MAKER";
    end
    tif = safeString(params, "timeInForce");
    if functions.ccxtruthy(tif != nothing)
        params = omit(params, "timeInForce");
        if functions.ccxtruthy(tif == "IOC")
            request[Symbol("type")] = "IMMEDIATE_OR_CANCEL";
        elseif functions.ccxtruthy(tif == "FOK")
            request[Symbol("type")] = "FILL_OR_KILL";
        end
    end
    return extend(request, params)

end
function createSpotOrder(self::Mexc, market, type_var, side, amount, price=nothing, marginMode=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    test = self.safeBool(params, "test", false);
    params = omit(params, "test");
    request = self.createSpotOrderRequest(market, type_var, side, amount, price, marginMode, params);
    if functions.ccxtruthy(test)
        response = Base.fetch(self.spotPrivatePostOrderTest(request));
    else
        response = Base.fetch(self.spotPrivatePostOrder(request));
    end
    order = self.parseOrder(response, market);
    order[Symbol("side")] = side;
    order[Symbol("type")] = type_var;
    if functions.ccxtruthy(safeString(order, "price") == nothing)
        order[Symbol("price")] = price;
    end
    if functions.ccxtruthy(safeString(order, "amount") == nothing)
        order[Symbol("amount")] = amount;
    end
    return order

end
function createSwapOrder(self::Mexc, market, type_var, side, amount, price=nothing, marginMode=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = get(market, Symbol("symbol"), nothing);
    openType = nothing;
    if functions.ccxtruthy(marginMode != nothing)
        if functions.ccxtruthy(marginMode == "cross")
            openType = 2;
        elseif functions.ccxtruthy(marginMode == "isolated")
            openType = 1;
        else
            throw(ArgumentsRequired(string(self.id, " createSwapOrder() marginMode parameter should be either \"cross\" or \"isolated\"")));
        end
    else
        openType = safeInteger(params, "openType", 2);
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((type_var != "limit"), (type_var != "market")), (type_var != 1)), (type_var != 2)), (type_var != 3)), (type_var != 4)), (type_var != 5)), (type_var != 6)))
        throw(InvalidOrder(string(self.id, " createSwapOrder() order type must either limit, market, or 1 for limit orders, 2 for post-only orders, 3 for IOC orders, 4 for FOK orders, 5 for market orders or 6 to convert market price to current price")));
    end
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(type_var == "market", type_var == 2, params);
    if functions.ccxtruthy(postOnly)
        type_var = 2;
    elseif functions.ccxtruthy(type_var == "limit")
        type_var = 1;
    else
        if functions.ccxtruthy(type_var == "market")
            type_var = 6;
        end

    end
    volString = self.amountToPrecision(symbol, amount);
    if functions.ccxtruthy(volString == nothing)
        volString = "0";
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("vol") => ccxt_toNumber(volString),
        Symbol("type") => type_var,
        Symbol("openType") => openType
    );
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((type_var != 5), (type_var != 6)), (type_var != "market")))
        priceString = self.priceToPrecision(symbol, price);
        if functions.ccxtruthy(priceString == nothing)
            priceString = "0";
        end
        request[Symbol("price")] = ccxt_toNumber(priceString);
    end
    if functions.ccxtruthy(openType == 1)
        leverage = safeInteger(params, "leverage");
        if functions.ccxtruthy(leverage == nothing)
            throw(ArgumentsRequired(string(self.id, " createSwapOrder() requires a leverage parameter for isolated margin orders")));
        end
    end
    reduceOnly = self.safeBool(params, "reduceOnly", false);
    hedged = self.safeBool(params, "hedged", false);
    sideInteger = nothing;
    if functions.ccxtruthy(hedged)
        if functions.ccxtruthy(reduceOnly)
            params = omit(params, "reduceOnly");
            sideInteger = functions.ccxtruthy((side == "buy")) ? 4 : 2;
        else
            sideInteger = functions.ccxtruthy((side == "buy")) ? 1 : 3;
        end
        request[Symbol("positionMode")] = 1;
    else
        if functions.ccxtruthy(reduceOnly)
            sideInteger = functions.ccxtruthy((side == "buy")) ? 2 : 4;
            params = omit(params, "reduceOnly");
        else
            sideInteger = functions.ccxtruthy((side == "buy")) ? 1 : 3;
        end
    end
    request[Symbol("side")] = sideInteger;
    clientOrderId = safeString2(params, "clientOrderId", "externalOid");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("externalOid")] = clientOrderId;
    end
    triggerPrice = self.safeNumber2(params, "triggerPrice", "stopPrice");
    params = omit(params, ["clientOrderId", "externalOid", "postOnly", "stopPrice", "triggerPrice", "hedged"]);
    if functions.ccxtruthy(triggerPrice)
        request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("triggerType")] = safeInteger(params, "triggerType", 1);
        request[Symbol("executeCycle")] = safeInteger(params, "executeCycle", 1);
        request[Symbol("trend")] = safeInteger(params, "trend", 1);
        request[Symbol("orderType")] = safeInteger(params, "orderType", 1);
        response = Base.fetch(self.contractPrivatePostPlanorderPlace(extend(request, params)));
    else
        response = Base.fetch(self.contractPrivatePostOrderCreate(extend(request, params)));
    end
    data = self.safeDict(response, "data");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(data, "orderId"),
    Symbol("timestamp") => safeInteger(data, "ts")
), market)

end
function createOrders(self::Mexc, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    symbol = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        market = self.market(marketId);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
            throw(NotSupported(string(self.id, " createOrders() is only supported for spot markets")));
        end
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
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("createOrder", params);
        orderRequest = self.createSpotOrderRequest(market, type_var, side, amount, price, marginMode, orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("batchOrders") => json(ordersRequests)
    );
    response = Base.fetch(self.spotPrivatePostBatchOrders(request));
    return self.parseOrders(response)

end
function fetchOrder(self::Mexc, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    data = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        clientOrderId = safeString(params, "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            params = omit(params, "clientOrderId");
            request[Symbol("origClientOrderId")] = clientOrderId;
        else
            request[Symbol("orderId")] = id;
        end
        (marginMode, query) = self.handleMarginModeAndParams("fetchOrder", params);
        if functions.ccxtruthy(marginMode != nothing)
            if functions.ccxtruthy(marginMode != "isolated")
                throw(BadRequest(string(self.id, " fetchOrder() does not support marginMode ", marginMode, " for spot-margin trading")));
            end
            data = Base.fetch(self.spotPrivateGetMarginOrder(extend(request, query)));
        else
            data = Base.fetch(self.spotPrivateGetOrder(extend(request, query)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("order_id")] = id;
        response = Base.fetch(self.contractPrivateGetOrderGetOrderId(extend(request, params)));
        data = safeValue(response, "data");
    end
    return self.parseOrder(data, market)

end
function fetchOrders(self::Mexc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    (marketType, query) = self.handleMarketTypeAndParams("fetchOrders", market, params);
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument for spot market")));
        end
        (marginMode, queryInner) = self.handleMarginModeAndParams("fetchOrders", params);
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(until != nothing)
            request[Symbol("endTime")] = until;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end

        if functions.ccxtruthy(marginMode != nothing)
            if functions.ccxtruthy(marginMode != "isolated")
                throw(BadRequest(string(self.id, " fetchOrders() does not support marginMode ", marginMode, " for spot-margin trading")));
            end
            response = Base.fetch(self.spotPrivateGetMarginAllOrders(extend(request, queryInner)));
        else
            response = Base.fetch(self.spotPrivateGetAllOrders(extend(request, queryInner)));
        end
            return self.parseOrders(response, market, since, limit)
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_time")] = since;
            end_var = safeInteger(params, "end_time", until);
            if functions.ccxtruthy(end_var == nothing)
                request[Symbol("end_time")] = self.sum(since, get(self.options, Symbol("maxTimeTillEnd"), nothing));
            else
                if functions.ccxtruthy(functions.ccxt_gt((end_var - since), get(self.options, Symbol("maxTimeTillEnd"), nothing)))
                    throw(BadRequest(string(self.id, " end is invalid, i.e. exceeds allowed 90 days.")));
                else
                    request[Symbol("end_time")] = until;
                end
            end
        elseif functions.ccxtruthy(until != nothing)
            request[Symbol("start_time")] = self.sum(until, get(self.options, Symbol("maxTimeTillEnd"), nothing) * -1);
            request[Symbol("end_time")] = until;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("page_size")] = limit;
        end
        method = safeString(self.options, "fetchOrders", "contractPrivateGetOrderListHistoryOrders");
        method = safeString(query, "method", method);
        ordersOfRegular = [];
        ordersOfTrigger = [];
        if functions.ccxtruthy(method == "contractPrivateGetOrderListHistoryOrders")
            response = Base.fetch(self.contractPrivateGetOrderListHistoryOrders(extend(request, query)));
            ordersOfRegular = safeValue(response, "data");
        else
            response = Base.fetch(self.contractPrivateGetPlanorderListOrders(extend(request, query)));
            ordersOfTrigger = safeValue(response, "data");
        end
        merged = arrayConcat(ordersOfTrigger, ordersOfRegular);
        return self.parseOrders(merged, market, since, limit, params)
    end

end
function fetchOrdersByIds(self::Mexc, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    (marketType, query) = self.handleMarketTypeAndParams("fetchOrdersByIds", market, params);
    if functions.ccxtruthy(marketType == "spot")
        throw(BadRequest(string(self.id, " fetchOrdersByIds() is not supported for ", marketType)));
    else
        request[Symbol("order_ids")] =         join(ids, ",");
        response = Base.fetch(self.contractPrivateGetOrderBatchQuery(extend(request, query)));
        data = self.safeList(response, "data");
        return self.parseOrders(data, market)
    end

end
function fetchOpenOrders(self::Mexc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    marketType = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market, params);
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol != nothing)
            request[Symbol("symbol")] = safeString(market, "id");
        end
        (marginMode, query) = self.handleMarginModeAndParams("fetchOpenOrders", params);

        if functions.ccxtruthy(marginMode != nothing)
            if functions.ccxtruthy(marginMode != "isolated")
                throw(BadRequest(string(self.id, " fetchOpenOrders() does not support marginMode ", marginMode, " for spot-margin trading")));
            end
            response = Base.fetch(self.spotPrivateGetMarginOpenOrders(extend(request, query)));
        else
            response = Base.fetch(self.spotPrivateGetOpenOrders(extend(request, query)));
        end
            return self.parseOrders(response, market, since, limit)
    else
        if functions.ccxtruthy(limit == nothing)
            request[Symbol("page_size")] = 100;
        end
        swapResponse = Base.fetch(self.contractPrivateGetOrderListOpenOrders(extend(request, params)));
        data = self.safeList(swapResponse, "data", []);
        return self.parseOrders(data, market, since, limit, params)
    end

end
function fetchClosedOrders(self::Mexc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState(3, symbol, since, limit, params))

end
function fetchCanceledOrders(self::Mexc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState(4, symbol, since, limit, params))

end
function fetchOrdersByState(self::Mexc, state, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    (marketType) = self.handleMarketTypeAndParams("fetchOrdersByState", market, params);
    if functions.ccxtruthy(marketType == "spot")
        throw(NotSupported(string(self.id, " fetchOrdersByState() is not supported for ", marketType)));
    else
        request[Symbol("states")] = state;
        return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))
    end

end
function cancelOrder(self::Mexc, id, symbol=nothing, params=Dict())
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
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrder", market, params);
    (marginMode, query) = self.handleMarginModeAndParams("cancelOrder", params);
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
        end
        requestInner = Dict{Symbol, Any}(
            Symbol("symbol") => safeString(market, "id")
        );
        clientOrderId = safeString(params, "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            params = omit(query, "clientOrderId");
            requestInner[Symbol("origClientOrderId")] = clientOrderId;
        else
            requestInner[Symbol("orderId")] = id;
        end
        if functions.ccxtruthy(marginMode != nothing)
            if functions.ccxtruthy(marginMode != "isolated")
                throw(BadRequest(string(self.id, " cancelOrder() does not support marginMode ", marginMode, " for spot-margin trading")));
            end
            data = Base.fetch(self.spotPrivateDeleteMarginOrder(extend(requestInner, query)));
        else
            data = Base.fetch(self.spotPrivateDeleteOrder(extend(requestInner, query)));
        end
    else
        method = safeString(self.options, "cancelOrder", "contractPrivatePostOrderCancel");
        method = safeString(query, "method", method);
        if functions.ccxtruthy(method == "contractPrivatePostOrderCancel")
            response = Base.fetch(self.contractPrivatePostOrderCancel([id]));
        elseif functions.ccxtruthy(method == "contractPrivatePostPlanorderCancel")
            response = Base.fetch(self.contractPrivatePostPlanorderCancel([id]));
        else
            throw(NotSupported(string(self.id, " cancelOrder() not support this method")));
        end
        data = safeValue(response, "data");
        order = safeValue(data, 0);
        errorMsg = safeValue(order, "errorMsg", "");
        if functions.ccxtruthy(errorMsg != "success")
            throw(InvalidOrder(string(self.id, " cancelOrder() the order with id ", id, " cannot be cancelled: ", errorMsg)));
        end
    end
    return self.parseOrder(data, market)

end
function cancelOrders(self::Mexc, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = functions.ccxtruthy((symbol != nothing)) ? self.market(symbol) : nothing;
    (marketType) = self.handleMarketTypeAndParams("cancelOrders", market, params);
    if functions.ccxtruthy(marketType == "spot")
        throw(BadRequest(string(self.id, " cancelOrders() is not supported for ", marketType)));
    else
        response = Base.fetch(self.contractPrivatePostOrderCancel(ids));
        data = self.safeList(response, "data");
        return self.parseOrders(data, market)
    end

end
function cancelAllOrders(self::Mexc, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelAllOrders", market, params);
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol == nothing)
            Base.fetch(self.spotPrivateDeleteOrderAll(params));
                return []
        end
        request[Symbol("symbol")] = safeString(market, "id");
        response = Base.fetch(self.spotPrivateDeleteOpenOrders(extend(request, params)));
            return self.parseOrders(response, market)
    else
        if functions.ccxtruthy(symbol != nothing)
            request[Symbol("symbol")] = safeString(market, "id");
        end
        method = safeString(self.options, "cancelAllOrders", "contractPrivatePostOrderCancelAll");
        method = safeString(params, "method", method);
        response = Dict{Symbol, Any}();
        if functions.ccxtruthy(method == "contractPrivatePostOrderCancelAll")
            response = Base.fetch(self.contractPrivatePostOrderCancelAll(extend(request, params)));
        elseif functions.ccxtruthy(method == "contractPrivatePostPlanorderCancelAll")
            response = Base.fetch(self.contractPrivatePostPlanorderCancelAll(extend(request, params)));
        end
        data = self.safeList(response, "data", []);
        return self.parseOrders(data, market)
    end

end
function parseOrder(self::Mexc, order, market=nothing)
    code = safeInteger(order, "code");
    if functions.ccxtruthy(code != nothing)
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("status") => "rejected",
    Symbol("clientOrderId") => safeString(order, "newClientOrderId")
))
    end
    id = nothing;
    if functions.ccxtruthy(isa(order, AbstractString))
        id = order;
    else
        id = safeString2(order, "orderId", "id");
    end
    timeInForce = self.parseOrderTimeInForce(safeString(order, "timeInForce"));
    typeRaw = safeString(order, "type");
    if functions.ccxtruthy(timeInForce == nothing)
        timeInForce = self.getTifFromRawOrderType(typeRaw);
    end
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    timestamp = safeIntegerN(order, ["time", "createTime", "transactTime"]);
    fee = nothing;
    feeCurrency = safeString(order, "feeCurrency");
    if functions.ccxtruthy(feeCurrency != nothing)
        takerFee = safeString(order, "takerFee");
        makerFee = safeString(order, "makerFee");
        feeSum = stringAdd(takerFee, makerFee);
        fee = Dict{Symbol, Any}(
            Symbol("currency") => feeCurrency,
            Symbol("cost") => self.parseNumber(feeSum)
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(order, "updateTime"),
    Symbol("status") => self.parseOrderStatus(safeString2(order, "status", "state")),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => self.parseOrderType(typeRaw),
    Symbol("timeInForce") => timeInForce,
    Symbol("side") => self.parseOrderSide(safeString(order, "side")),
    Symbol("price") => self.safeNumber(order, "price"),
    Symbol("triggerPrice") => self.safeNumber2(order, "stopPrice", "triggerPrice"),
    Symbol("average") => self.safeNumber(order, "dealAvgPrice"),
    Symbol("amount") => self.safeNumber2(order, "origQty", "vol"),
    Symbol("cost") => self.safeNumber(order, "cummulativeQuoteQty"),
    Symbol("filled") => self.safeNumber2(order, "executedQty", "dealVol"),
    Symbol("remaining") => nothing,
    Symbol("fee") => fee,
    Symbol("trades") => nothing,
    Symbol("info") => order
), market)

end
function parseOrderSide(self::Mexc, status)
    statuses = Dict{Symbol, Any}(
        Symbol("BUY") => "buy",
        Symbol("SELL") => "sell",
        Symbol("1") => "buy",
        Symbol("2") => "sell"
    );
    return safeString(statuses, status, status)

end
function parseOrderType(self::Mexc, status)
    statuses = Dict{Symbol, Any}(
        Symbol("MARKET") => "market",
        Symbol("LIMIT") => "limit",
        Symbol("LIMIT_MAKER") => "limit",
        Symbol("IMMEDIATE_OR_CANCEL") => "limit",
        Symbol("FILL_OR_KILL") => "limit"
    );
    return safeString(statuses, status, status)

end
function parseOrderStatus(self::Mexc, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("PARTIALLY_CANCELED") => "canceled",
        Symbol("2") => "open",
        Symbol("3") => "closed",
        Symbol("4") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrderTimeInForce(self::Mexc, status)
    statuses = Dict{Symbol, Any}(
        Symbol("GTC") => "GTC",
        Symbol("FOK") => "FOK",
        Symbol("IOC") => "IOC"
    );
    return safeString(statuses, status, status)

end
function getTifFromRawOrderType(self::Mexc, orderType=nothing)
    statuses = Dict{Symbol, Any}(
        Symbol("LIMIT") => "GTC",
        Symbol("LIMIT_MAKER") => "POST_ONLY",
        Symbol("IMMEDIATE_OR_CANCEL") => "IOC",
        Symbol("FILL_OR_KILL") => "FOK",
        Symbol("MARKET") => "IOC"
    );
    return safeString(statuses, orderType, orderType)

end
function fetchAccountHelper(self::Mexc, type_var, params)
    if functions.ccxtruthy(type_var == "spot")
            return Base.fetch(self.spotPrivateGetAccount(params))
    elseif functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.contractPrivateGetAccountAssets(params));
        return safeValue(response, "data")
    end
    return nothing

end
function fetchAccounts(self::Mexc, params=Dict())
    (marketType, query) = self.handleMarketTypeAndParams("fetchAccounts", nothing, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.fetchAccountHelper(marketType, query));
    data = safeValue(response, "balances", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        account = get(data, i + 1, nothing);
        currencyId = safeString2(account, "asset", "currency");
        code = self.safeCurrencyCode(currencyId);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => safeString(account, "id"),
    Symbol("type") => safeString(account, "type"),
    Symbol("code") => code,
    Symbol("info") => account
));
        i += 1
    end
    return result

end
function fetchTradingFee(self::Mexc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(BadRequest(string(self.id, " fetchTradingFee() supports spot markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.spotPrivateGetTradeFee(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(data, "makerCommission"),
    Symbol("taker") => self.safeNumber(data, "takerCommission"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function customParseBalance(self::Mexc, response, marketType)
    if functions.ccxtruthy(marketType == "margin")
        wallet = safeValue(response, "assets", []);
    elseif functions.ccxtruthy(marketType == "swap")
        wallet = safeValue(response, "data", []);
    else
        wallet = safeValue(response, "balances", []);
    end
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    if functions.ccxtruthy(marketType == "margin")
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(wallet)))
            entry = get(wallet, i + 1, nothing);
            marketId = safeString(entry, "symbol");
            symbol = self.safeSymbol(marketId);
            base = safeValue(entry, "baseAsset", Dict{Symbol, Any}());
            quote_var = safeValue(entry, "quoteAsset", Dict{Symbol, Any}());
            baseCode = self.safeCurrencyCode(safeString(base, "asset"));
            quoteCode = self.safeCurrencyCode(safeString(quote_var, "asset"));
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

            return result
    elseif functions.ccxtruthy(marketType == "swap")
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(wallet)))
            entry = get(wallet, i + 1, nothing);
            currencyId = safeString(entry, "currency");
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString(entry, "availableBalance");
            account[Symbol("used")] = safeString(entry, "frozenBalance");
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end
        return self.safeBalance(result)
    else
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(wallet)))
            entry = get(wallet, i + 1, nothing);
            currencyId = safeString(entry, "asset");
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString(entry, "free");
            account[Symbol("used")] = safeString(entry, "locked");
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end
        return self.safeBalance(result)
    end

end
function parseBalanceHelper(self::Mexc, entry)
    account = self.account();
    account[Symbol("used")] = safeString(entry, "locked");
    account[Symbol("free")] = safeString(entry, "free");
    account[Symbol("total")] = safeString(entry, "totalAsset");
    debt = safeString(entry, "borrowed");
    interest = safeString(entry, "interest");
    account[Symbol("debt")] = stringAdd(debt, interest);
    return account

end
function fetchBalance(self::Mexc, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    request = Dict{Symbol, Any}();
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    marginMode = safeString(params, "marginMode");
    isMargin = self.safeBool(params, "margin", false);
    params = omit(params, ["margin", "marginMode"]);
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((marginMode != nothing), (isMargin)), (marketType == "margin")))
        parsedSymbols = nothing;
        symbol = safeString(params, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            symbols = safeValue(params, "symbols");
            if functions.ccxtruthy(symbols != nothing)
                symbolIds = self.marketIds(symbols);
                if functions.ccxtruthy(symbolIds != nothing)
                    parsedSymbols = join(symbolIds, ",");
                end
            end
        else
            market = self.market(symbol);
            parsedSymbols = get(market, Symbol("id"), nothing);
        end
        self.checkRequiredArgument("fetchBalance", parsedSymbols, "symbol or symbols");
        marketType = "margin";
        request[Symbol("symbols")] = parsedSymbols;
        params = omit(params, ["symbol", "symbols"]);
        response = Base.fetch(self.spotPrivateGetMarginIsolatedAccount(extend(request, params)));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.spotPrivateGetAccount(extend(request, params)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.contractPrivateGetAccountAssets(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " fetchBalance() not support this method")));
        end

    end
    return self.customParseBalance(response, marketType)

end
function fetchMyTrades(self::Mexc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    trades = [];
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        until = safeInteger(params, "until");
        if functions.ccxtruthy(until != nothing)
            params = omit(params, "until");
            request[Symbol("endTime")] = until;
        end
        trades = Base.fetch(self.spotPrivateGetMyTrades(extend(request, params)));
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_time")] = since;
            end_var = safeInteger(params, "end_time");
            if functions.ccxtruthy(end_var == nothing)
                request[Symbol("end_time")] = self.sum(since, get(self.options, Symbol("maxTimeTillEnd"), nothing));
            end
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("page_size")] = limit;
        end
        response = Base.fetch(self.contractPrivateGetOrderListOrderDeals(extend(request, params)));
        trades = self.safeList(response, "data", []);
    end
    return self.parseTrades(trades, market, since, limit)

end
function fetchOrderTrades(self::Mexc, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    (marketType, query) = self.handleMarketTypeAndParams("fetchOrderTrades", market, params);
    trades = [];
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrderTrades() requires a symbol argument")));
        end
        request[Symbol("symbol")] = safeString(market, "id");
        request[Symbol("orderId")] = id;
        trades = Base.fetch(self.spotPrivateGetMyTrades(extend(request, query)));
    else
        request[Symbol("order_id")] = id;
        response = Base.fetch(self.contractPrivateGetOrderDealDetailsOrderId(extend(request, query)));
        trades = self.safeList(response, "data", []);
    end
    return self.parseTrades(trades, market, since, limit, query)

end
function modifyMarginHelper(self::Mexc, symbol, amount, addOrReduce, params=Dict())
    positionId = safeInteger(params, "positionId");
    if functions.ccxtruthy(positionId == nothing)
        throw(ArgumentsRequired(string(self.id, " modifyMarginHelper() requires a positionId parameter")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("positionId") => positionId,
        Symbol("amount") => amount,
        Symbol("type") => addOrReduce
    );
    response = Base.fetch(self.contractPrivatePostPositionChangeMargin(extend(request, params)));
    return response

end
function reduceMargin(self::Mexc, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "SUB", params))

end
function addMargin(self::Mexc, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "ADD", params))

end
function setLeverage(self::Mexc, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage
    );
    positionId = safeInteger(params, "positionId");
    if functions.ccxtruthy(positionId == nothing)
        openType = self.safeNumber(params, "openType");
        positionType = self.safeNumber(params, "positionType");
        market = functions.ccxtruthy((symbol != nothing)) ? self.market(symbol) : nothing;
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((openType == nothing), (positionType == nothing)), (market == nothing)))
            throw(ArgumentsRequired(string(self.id, " setLeverage() requires a positionId parameter or a symbol argument with openType and positionType parameters, use openType 1 or 2 for isolated or cross margin respectively, use positionType 1 or 2 for long or short positions")));
        else
            request[Symbol("openType")] = openType;
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            request[Symbol("positionType")] = positionType;
        end
    else
        request[Symbol("positionId")] = positionId;
    end
    return Base.fetch(self.contractPrivatePostPositionChangeLeverage(extend(request, params)))

end
function fetchFundingHistory(self::Mexc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    response = Base.fetch(self.contractPrivateGetPositionFundingRecords(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    resultList = safeValue(data, "resultList", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(resultList)))
        entry = get(resultList, i + 1, nothing);
        timestamp = safeInteger(entry, "settleTime");
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbol,
    Symbol("code") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => self.safeNumber(entry, "id"),
    Symbol("amount") => self.safeNumber(entry, "funding")
));
        i += 1
    end
    return result

end
function parseFundingRate(self::Mexc, contract, market=nothing)
    nextFundingRate = self.safeNumber2(contract, "fundingRate", "rate");
    nextFundingTimestamp = safeInteger(contract, "nextSettleTime");
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market, nothing, "contract");
    timestamp = safeInteger(contract, "timestamp");
    interval = safeString(contract, "collectCycle");
    intervalString = nothing;
    if functions.ccxtruthy(interval != nothing)
        intervalString = string(interval, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => nextFundingRate,
    Symbol("fundingTimestamp") => nextFundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => intervalString
)

end
function fetchFundingInterval(self::Mexc, symbol, params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params))

end
function fetchFundingRate(self::Mexc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractPublicGetFundingRateSymbol(extend(request, params)));
    result = safeValue(response, "data", Dict{Symbol, Any}());
    return self.parseFundingRate(result, market)

end
function fetchFundingRateHistory(self::Mexc, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    response = Base.fetch(self.contractPublicGetFundingRateHistory(extend(request, params)));
    data = safeValue(response, "data");
    result = safeValue(data, "resultList", []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        entry = get(result, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        symbolInner = self.safeSymbol(marketId);
        timestamp = safeInteger(entry, "settleTime");
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
function fetchLeverageTiers(self::Mexc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, "swap", true, true);
    response = Base.fetch(self.contractPublicGetDetail(params));
    data = self.safeList(response, "data");
    return self.parseLeverageTiers(data, symbols, "symbol")

end
function parseMarketLeverageTiers(self::Mexc, info, market=nothing)
    marketId = safeString(info, "symbol");
    maintenanceMarginRate = safeString(info, "maintenanceMarginRate");
    initialMarginRate = safeString(info, "initialMarginRate");
    maxVol = safeString(info, "maxVol");
    riskIncrVol = safeString(info, "riskIncrVol");
    riskIncrMmr = safeString(info, "riskIncrMmr");
    riskIncrImr = safeString(info, "riskIncrImr");
    floor_var = "0";
    tiers = [];
    quoteId = safeString(info, "quoteCoin");
    if functions.ccxtruthy(riskIncrVol == "0")
            return [Dict{Symbol, Any}(
    Symbol("tier") => 0,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("currency") => self.safeCurrencyCode(quoteId),
    Symbol("minNotional") => nothing,
    Symbol("maxNotional") => nothing,
    Symbol("maintenanceMarginRate") => nothing,
    Symbol("maxLeverage") => self.safeNumber(info, "maxLeverage"),
    Symbol("info") => info
)]
    end
    while functions.ccxtruthy(stringLt(floor_var, maxVol))
        cap = stringAdd(floor_var, riskIncrVol);
        minNotional = self.parseNumber(floor_var);
        mainMarginRate = self.parseNumber(maintenanceMarginRate);
        maxLev = self.parseNumber(stringDiv("1", initialMarginRate));
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.parseNumber(stringDiv(cap, riskIncrVol)),
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("currency") => self.safeCurrencyCode(quoteId),
    Symbol("minNotional") => minNotional,
    Symbol("maxNotional") => self.parseNumber(cap),
    Symbol("maintenanceMarginRate") => mainMarginRate,
    Symbol("maxLeverage") => maxLev,
    Symbol("info") => info
));
        initialMarginRate = stringAdd(initialMarginRate, riskIncrImr);
        maintenanceMarginRate = stringAdd(maintenanceMarginRate, riskIncrMmr);
        floor_var = cap;
    end
    return tiers

end
function parseDepositAddress(self::Mexc, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    currencyId = safeString(depositAddress, "coin");
    code = self.safeCurrencyCode(currencyId, currency);
    networkId = safeString(depositAddress, "netWork");
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "memo")
)

end
function fetchDepositAddressesByNetwork(self::Mexc, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    networkCode = safeString(params, "network");
    networkId = nothing;
    if functions.ccxtruthy(networkCode != nothing)
        networkUnified = self.networkIdToCode(networkCode, code);
        networks = self.safeDict(currency, "networks", Dict{Symbol, Any}());
        if functions.ccxtruthy(@functions.ccxt_and((networkUnified != nothing), (ccxt_in(networkUnified, networks))))
            network = functions.ccxtruthy((networkUnified == nothing)) ? Dict{Symbol, Any}() : self.safeDict(networks, networkUnified, Dict{Symbol, Any}());
            networkInfo = safeValue(network, "info", Dict{Symbol, Any}());
            networkId = safeString(networkInfo, "network");
        else
            networkId = self.networkCodeToId(networkCode, code);
        end
    end
    if functions.ccxtruthy(networkId != nothing)
        request[Symbol("network")] = networkId;
    end
    params = omit(params, "network");
    response = Base.fetch(self.spotPrivateGetCapitalDepositAddress(extend(request, params)));
    addressStructures = self.parseDepositAddresses(response, nothing, false);
    return indexBy(addressStructures, "network")

end
function createDepositAddress(self::Mexc, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    networkCode = safeString(params, "network");
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " createDepositAddress requires a `network` parameter")));
    end
    networkId = nothing;
    networkUnified = self.networkIdToCode(networkCode, code);
    networks = self.safeDict(currency, "networks", Dict{Symbol, Any}());
    if functions.ccxtruthy(@functions.ccxt_and((networkUnified != nothing), (ccxt_in(networkUnified, networks))))
        network = functions.ccxtruthy((networkUnified == nothing)) ? Dict{Symbol, Any}() : self.safeDict(networks, networkUnified, Dict{Symbol, Any}());
        networkInfo = safeValue(network, "info", Dict{Symbol, Any}());
        networkId = safeString(networkInfo, "network");
    else
        networkId = self.networkCodeToId(networkCode, code);
    end
    if functions.ccxtruthy(networkId != nothing)
        request[Symbol("network")] = networkId;
    end
    params = omit(params, "network");
    response = Base.fetch(self.spotPrivatePostCapitalDepositAddress(extend(request, params)));
    return self.parseDepositAddress(response, currency)

end
function fetchDepositAddress(self::Mexc, code, params=Dict())
    network = safeString(params, "network");
    addressStructures = Base.fetch(self.fetchDepositAddressesByNetwork(code, params));
    if functions.ccxtruthy(network != nothing)
        netCode = self.networkIdToCode(network, code);
        result = functions.ccxtruthy((netCode == nothing)) ? nothing : self.safeDict(addressStructures, netCode);
    else
        options = self.safeDict(self.options, "defaultNetworks");
        defaultNetworkForCurrency = safeString(options, code);
        if functions.ccxtruthy(defaultNetworkForCurrency != nothing)
            result = self.safeDict(addressStructures, defaultNetworkForCurrency);
        else
            keys_var = objectKeys(addressStructures);
            key = safeString(keys_var, 0);
            result = self.safeDict(addressStructures, key);
        end
    end
    if functions.ccxtruthy(result == nothing)
        throw(InvalidAddress(string(self.id, " fetchDepositAddress() cannot find a deposit address for ", code, ", and network", network, "consider creating one using .createDepositAddress() method or in MEXC website")));
    end
    return result

end
function fetchDeposits(self::Mexc, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
        rawNetwork = safeString(params, "network");
        if functions.ccxtruthy(rawNetwork != nothing)
            params = omit(params, "network");
            request[Symbol("coin")] = string(get(request, Symbol("coin"), nothing), "-", rawNetwork);
        end
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(limit, 1000))
            throw(ExchangeError("This exchange supports a maximum limit of 1000"));
        end
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.spotPrivateGetCapitalDepositHisrec(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function fetchWithdrawals(self::Mexc, code=nothing, since=nothing, limit=nothing, params=Dict())
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
        if functions.ccxtruthy(functions.ccxt_gt(limit, 1000))
            throw(ExchangeError("This exchange supports a maximum limit of 1000"));
        end
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.spotPrivateGetCapitalWithdrawHistory(extend(request, params)));
    return self.parseTransactions(response, currency, since, limit)

end
function parseTransaction(self::Mexc, transaction, currency=nothing)
    id = safeString2(transaction, "id", "tranId");
    type_var = functions.ccxtruthy((id == nothing)) ? "deposit" : "withdrawal";
    timestamp = safeInteger2(transaction, "insertTime", "applyTime");
    updated = safeInteger(transaction, "updateTime");
    currencyId = nothing;
    currencyWithNetwork = safeString(transaction, "coin");
    if functions.ccxtruthy(currencyWithNetwork != nothing)
        currencyId = get(split(currencyWithNetwork, "-"), 1, nothing);
    end
    code = self.safeCurrencyCode(currencyId, currency);
    network = nothing;
    rawNetwork = safeString(transaction, "network");
    if functions.ccxtruthy(rawNetwork != nothing)
        network = self.networkIdToCode(rawNetwork, code);
    end
    status = self.parseTransactionStatusByType(safeString(transaction, "status"), type_var);
    amountString = safeString(transaction, "amount");
    address = safeString(transaction, "address");
    txid = safeString2(transaction, "transHash", "txId");
    fee = nothing;
    feeCostString = safeString(transaction, "transactionFee");
    if functions.ccxtruthy(feeCostString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCostString),
            Symbol("currency") => code
        );
    end
    if functions.ccxtruthy(type_var == "withdrawal")
        amountString = stringSub(amountString, feeCostString);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => network,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => safeString(transaction, "memo"),
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("comment") => safeString(transaction, "remark"),
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
function parseTransactionStatusByType(self::Mexc, status, type_var=nothing)
    statusesByType = Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("1") => "failed",
            Symbol("2") => "pending",
            Symbol("3") => "pending",
            Symbol("4") => "pending",
            Symbol("5") => "ok",
            Symbol("6") => "pending",
            Symbol("7") => "failed"
        ),
        Symbol("withdrawal") => Dict{Symbol, Any}(
            Symbol("1") => "pending",
            Symbol("2") => "pending",
            Symbol("3") => "pending",
            Symbol("4") => "pending",
            Symbol("5") => "pending",
            Symbol("6") => "pending",
            Symbol("7") => "ok",
            Symbol("8") => "failed",
            Symbol("9") => "canceled",
            Symbol("10") => "pending"
        )
    );
    statuses = safeValue(statusesByType, type_var, Dict{Symbol, Any}());
    return safeString(statuses, status, status)

end
function closeAllPositions(self::Mexc, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.contractPrivatePostPositionCloseAll(params));
    data = self.safeList(response, "data", []);
    return self.parsePositions(data)

end
function fetchPosition(self::Mexc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.fetchPositions(nothing, extend(request, params)));
    return safeValue(response, 0)

end
function fetchPositions(self::Mexc, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.contractPrivateGetPositionOpenPositions(params));
    data = self.safeList(response, "data", []);
    return self.parsePositions(data, symbols)

end
function parsePosition(self::Mexc, position, market=nothing)
    market = self.safeMarket(safeString(position, "symbol"), market, nothing, "swap");
    symbol = get(market, Symbol("symbol"), nothing);
    contracts = safeString(position, "holdVol");
    entryPrice = self.safeNumber(position, "openAvgPrice");
    initialMargin = safeString(position, "im");
    rawSide = safeString(position, "positionType");
    side = functions.ccxtruthy((rawSide == "1")) ? "long" : "short";
    openType = safeString(position, "margin_mode");
    marginType = functions.ccxtruthy((openType == "1")) ? "isolated" : "cross";
    leverage = self.safeNumber(position, "leverage");
    liquidationPrice = self.safeNumber(position, "liquidatePrice");
    timestamp = safeInteger(position, "updateTime");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("contracts") => self.parseNumber(contracts),
    Symbol("contractSize") => nothing,
    Symbol("entryPrice") => entryPrice,
    Symbol("collateral") => nothing,
    Symbol("side") => side,
    Symbol("unrealizedPnl") => nothing,
    Symbol("leverage") => self.parseNumber(leverage),
    Symbol("percentage") => nothing,
    Symbol("marginMode") => marginType,
    Symbol("notional") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("initialMargin") => self.parseNumber(initialMargin),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("hedged") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing,
    Symbol("lastUpdateTimestamp") => nothing
))

end
function fetchTransfer(self::Mexc, id, code=nothing, params=Dict())
    (marketType, query) = self.handleMarketTypeAndParams("fetchTransfer", nothing, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(marketType == "spot")
        request = Dict{Symbol, Any}(
            Symbol("transact_id") => id
        );
        response = Base.fetch(self.spotPrivateGetAssetInternalTransferRecord(extend(request, query)));
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
            return self.parseTransfer(data)
    elseif functions.ccxtruthy(marketType == "swap")
        throw(BadRequest(string(self.id, " fetchTransfer() is not supported for ", marketType)));
    end
    throw(BadRequest(string(self.id, " fetchTransfer() is not supported for ", marketType)));

end
function fetchTransfers(self::Mexc, code=nothing, since=nothing, limit=nothing, params=Dict())
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTransfers", nothing, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    fromAccountType = nothing;
    (fromAccountType, params) = self.handleOptionAndParams(params, "fetchTransfers", "fromAccountType");
    accountTypes = Dict{Symbol, Any}(
        Symbol("spot") => "SPOT",
        Symbol("swap") => "FUTURES",
        Symbol("futures") => "FUTURES",
        Symbol("future") => "FUTURES",
        Symbol("margin") => "SPOT"
    );
    if functions.ccxtruthy(fromAccountType != nothing)
        request[Symbol("fromAccountType")] = safeString(accountTypes, fromAccountType, fromAccountType);
    else
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a fromAccountType parameter, one of \"SPOT\", \"FUTURES\"")));
    end
    toAccountType = nothing;
    (toAccountType, params) = self.handleOptionAndParams(params, "fetchTransfers", "toAccountType");
    if functions.ccxtruthy(toAccountType != nothing)
        request[Symbol("toAccountType")] = safeString(accountTypes, toAccountType, toAccountType);
    else
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a toAccountType parameter, one of \"SPOT\", \"FUTURES\"")));
    end
    resultList = [];
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
                throw(ExchangeError("This exchange supports a maximum limit of 50"));
            end
            request[Symbol("size")] = limit;
        end
        response = Base.fetch(self.spotPrivateGetCapitalTransfer(extend(request, params)));
        resultList = self.safeList(response, "rows", []);
    elseif functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("page_size")] = limit;
        end
        response = Base.fetch(self.contractPrivateGetAccountTransferRecord(extend(request, params)));
        data = safeValue(response, "data");
        resultList = safeValue(data, "resultList");
    end
    return self.parseTransfers(resultList, currency, since, limit)

end
function transfer(self::Mexc, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accounts = Dict{Symbol, Any}(
        Symbol("spot") => "SPOT",
        Symbol("swap") => "FUTURES",
        Symbol("future") => "FUTURES"
    );
    fromId = safeString(accounts, fromAccount, fromAccount);
    toId = safeString(accounts, toAccount, toAccount);
    if functions.ccxtruthy(fromId == nothing)
        keys_var = objectKeys(accounts);
        throw(ExchangeError(string(self.id, " fromAccount must be one of ", join(keys_var, ", "))));
    end
    if functions.ccxtruthy(toId == nothing)
        keys_var = objectKeys(accounts);
        throw(ExchangeError(string(self.id, " toAccount must be one of ", join(keys_var, ", "))));
    end
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("fromAccountType") => fromId,
        Symbol("toAccountType") => toId
    );
    if functions.ccxtruthy(@functions.ccxt_or((fromId == "ISOLATED_MARGIN"), (toId == "ISOLATED_MARGIN")))
        symbol = safeString(params, "symbol");
        params = omit(params, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " transfer() requires a symbol argument for isolated margin")));
        end
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.spotPrivatePostCapitalTransfer(extend(request, params)));
    transaction = self.parseTransfer(response, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount
))

end
function parseTransfer(self::Mexc, transfer, currency=nothing)
    currencyId = safeString2(transfer, "currency", "asset");
    id = safeStringN(transfer, ["transact_id", "txid", "tranId"]);
    timestamp = safeInteger2(transfer, "createTime", "timestamp");
    datetime = functions.ccxtruthy((timestamp != nothing)) ? self.iso8601(timestamp) : nothing;
    direction = safeString(transfer, "type");
    accountFrom = nothing;
    accountTo = nothing;
    fromAccountType = safeString(transfer, "fromAccountType");
    toAccountType = safeString(transfer, "toAccountType");
    if functions.ccxtruthy(@functions.ccxt_and((fromAccountType != nothing), (toAccountType != nothing)))
        accountFrom = fromAccountType;
        accountTo = toAccountType;
    elseif functions.ccxtruthy(direction != nothing)
        accountFrom = functions.ccxtruthy((direction == "IN")) ? "MAIN" : "CONTRACT";
        accountTo = functions.ccxtruthy((direction == "IN")) ? "CONTRACT" : "MAIN";
    else
        accountFrom = safeString(transfer, "from");
        accountTo = safeString(transfer, "to");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => self.parseAccountId(accountFrom),
    Symbol("toAccount") => self.parseAccountId(accountTo),
    Symbol("status") => self.parseTransferStatus(safeStringN(transfer, ["transact_state", "state", "status"]))
)

end
function parseAccountId(self::Mexc, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SPOT") => "spot",
        Symbol("FUTURES") => "swap",
        Symbol("MAIN") => "spot",
        Symbol("CONTRACT") => "swap"
    );
    return safeString(statuses, status, status)

end
function parseTransferStatus(self::Mexc, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SUCCESS") => "ok",
        Symbol("FAILED") => "failed",
        Symbol("WAIT") => "pending"
    );
    return safeString(statuses, status, status)

end
function withdraw(self::Mexc, code, amount, address, tag=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    internal = self.safeBool(params, "internal", false);
    if functions.ccxtruthy(internal)
        params = omit(params, "internal");
        requestForInternal = Dict{Symbol, Any}(
            Symbol("asset") => get(currency, Symbol("id"), nothing),
            Symbol("amount") => amount,
            Symbol("toAccount") => address
        );
        toAccountType = safeString(params, "toAccountType");
        if functions.ccxtruthy(toAccountType == nothing)
            throw(ArgumentsRequired(string(self.id, " withdraw() requires a toAccountType parameter for internal transfer to be of: EMAIL | UID | MOBILE")));
        end
        responseForInternal = Base.fetch(self.spotPrivatePostCapitalTransferInternal(extend(requestForInternal, params)));
            return self.parseTransaction(responseForInternal, currency)
    end
    networks = self.safeDict(self.options, "networks", Dict{Symbol, Any}());
    network = safeString2(params, "network", "netWork");
    network = safeString(networks, network, network);
    network = self.networkCodeToId(network, get(currency, Symbol("code"), nothing));
    self.checkAddress(address);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("amount") => amount
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    if functions.ccxtruthy(network != nothing)
        request[Symbol("netWork")] = network;
        params = omit(params, ["network", "netWork"]);
    end
    response = Base.fetch(self.spotPrivatePostCapitalWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function setPositionMode(self::Mexc, hedged, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("positionMode") => functions.ccxtruthy(hedged) ? 1 : 2
    );
    response = Base.fetch(self.contractPrivatePostPositionChangePositionMode(extend(request, params)));
    return response

end
function fetchPositionMode(self::Mexc, symbol=nothing, params=Dict())
    response = Base.fetch(self.contractPrivateGetPositionPositionMode(params));
    positionMode = safeInteger(response, "data");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("hedged") => (positionMode == 1)
)

end
function fetchTransactionFees(self::Mexc, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.spotPrivateGetCapitalConfigGetall(params));
    return self.parseTransactionFees(response, codes)

end
function parseTransactionFees(self::Mexc, response, codes=nothing)
    withdrawFees = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        currencyId = safeString(entry, "coin");
        currency = self.safeCurrency(currencyId);
        code = safeString(currency, "code");
        if functions.ccxtruthy(@functions.ccxt_or((codes == nothing), (inArray(code, codes))))
            withdrawFees[Symbol(code)] = self.parseTransactionFee(entry, currency);
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("withdraw") => withdrawFees,
    Symbol("deposit") => Dict{Symbol, Any}(),
    Symbol("info") => response
)

end
function parseTransactionFee(self::Mexc, transaction, currency=nothing)
    networkList = safeValue(transaction, "networkList", []);
    result = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
        networkEntry = get(networkList, j + 1, nothing);
        networkId = safeString(networkEntry, "network");
        networkCode = safeString(get(self.options, Symbol("networks"), nothing), networkId, networkId);
        fee = self.safeNumber(networkEntry, "withdrawFee");
        result[Symbol(networkCode)] = fee;
        j += 1
    end
    return result

end
function fetchDepositWithdrawFees(self::Mexc, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.spotPrivateGetCapitalConfigGetall(params));
    return self.parseDepositWithdrawFees(response, codes, "coin")

end
function parseDepositWithdrawFee(self::Mexc, fee, currency=nothing)
    networkList = safeValue(fee, "networkList", []);
    result = self.depositWithdrawFee(fee);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
        networkEntry = get(networkList, j + 1, nothing);
        networkId = safeString(networkEntry, "network");
        networkCode = self.networkIdToCode(networkId, safeString(currency, "code"));
        if functions.ccxtruthy(networkCode != nothing)
            result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("fee") => self.safeNumber(networkEntry, "withdrawFee"),
                    Symbol("percentage") => nothing
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("fee") => nothing,
                    Symbol("percentage") => nothing
                )
            );
        end
        j += 1
    end
    return self.assignDefaultDepositWithdrawFees(result)

end
function fetchLeverage(self::Mexc, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.contractPrivateGetPositionLeverage(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseLeverage(data, market)

end
function parseLeverage(self::Mexc, leverage, market=nothing)
    marginMode = nothing;
    longLeverage = nothing;
    shortLeverage = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(leverage)))
        entry = get(leverage, i + 1, nothing);
        openType = safeInteger(entry, "openType");
        positionType = safeInteger(entry, "positionType");
        if functions.ccxtruthy(positionType == 1)
            longLeverage = safeInteger(entry, "leverage");
        elseif functions.ccxtruthy(positionType == 2)
            shortLeverage = safeInteger(entry, "leverage");
        end
        marginMode = functions.ccxtruthy((openType == 1)) ? "isolated" : "cross";
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => longLeverage,
    Symbol("shortLeverage") => shortLeverage
)

end
function handleMarginModeAndParams(self::Mexc, methodName, params=Dict(), defaultValue=nothing)
    defaultType = safeString(self.options, "defaultType");
    isMargin = self.safeBool(params, "margin", false);
    marginMode = nothing;
    (marginMode, params) = handleMarginModeAndParams(self.parent, methodName, params, defaultValue);
    if functions.ccxtruthy(@functions.ccxt_or((defaultType == "margin"), (isMargin)))
        marginMode = "isolated";
    end
    return [marginMode, params]

end
function fetchPositionsHistory(self::Mexc, symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    response = Base.fetch(self.contractPrivateGetPositionListHistoryPositions(extend(request, params)));
    data = self.safeList(response, "data", []);
    positions = self.parsePositions(data, symbols, params);
    return self.filterBySinceLimit(positions, since, limit)

end
function setMarginMode(self::Mexc, marginMode, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(BadSymbol(string(self.id, " setMarginMode() supports contract markets only")));
    end
    marginModeLower = lowercase(marginMode);
    if functions.ccxtruthy(@functions.ccxt_and(marginModeLower != "isolated", marginModeLower != "cross"))
        throw(BadRequest(string(self.id, " setMarginMode() marginMode argument should be isolated or cross")));
    end
    leverage = safeInteger(params, "leverage");
    if functions.ccxtruthy(leverage == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a leverage parameter")));
    end
    direction = safeStringLower2(params, "direction", "positionId");
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage,
        Symbol("openType") => functions.ccxtruthy((marginModeLower == "isolated")) ? 1 : 2
    );
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(direction != nothing)
        request[Symbol("positionType")] = functions.ccxtruthy((direction == "short")) ? 2 : 1;
    end
    params = omit(params, "direction");
    response = Base.fetch(self.contractPrivatePostPositionChangeLeverage(extend(request, params)));
    return self.parseLeverage(response, market)

end
function nonce(self::Mexc, )
    return milliseconds() - safeInteger(self.options, "timeDifference", 0)

end
function sign(self::Mexc, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    section = safeString(api, 0);
    access = safeString(api, 1);
    (path, params) = self.resolvePath(path, params);
    url = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(section == "spot", section == "broker"))
        if functions.ccxtruthy(section == "broker")
            url = string(get(get(get(self.urls, Symbol("api"), nothing), Symbol(section), nothing), Symbol(access), nothing), "/", path);
        else
            url = string(get(get(get(self.urls, Symbol("api"), nothing), Symbol(section), nothing), Symbol(access), nothing), "/api/", self.version, "/", path);
        end
        urlParams = params;
        if functions.ccxtruthy(access == "private")
            if functions.ccxtruthy(@functions.ccxt_and(section == "broker", (@functions.ccxt_or(@functions.ccxt_or((method == "POST"), (method == "PUT")), (method == "DELETE")))))
                urlParams = Dict{Symbol, Any}(
                    Symbol("timestamp") => self.nonce(),
                    Symbol("recvWindow") => safeInteger(self.options, "recvWindow", 5000)
                );
                body = json(params);
            else
                urlParams[Symbol("timestamp")] = self.nonce();
                urlParams[Symbol("recvWindow")] = safeInteger(self.options, "recvWindow", 5000);
            end
        end
        paramsEncoded = "";
        if functions.ccxtruthy(length(objectKeys(urlParams)))
            paramsEncoded = self.urlencode(urlParams);
            url += string("?", paramsEncoded);
        end
        if functions.ccxtruthy(access == "private")
            self.checkRequiredCredentials();
            signature = self.hmac(self.encode(paramsEncoded), self.encode(self.secret), sha256);
            url += string("&", "signature=", signature);
            headers = Dict{Symbol, Any}(
                Symbol("X-MEXC-APIKEY") => self.apiKey,
                Symbol("source") => safeString(self.options, "broker", "CCXT")
            );
        end
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((method == "POST"), (method == "PUT")), (method == "DELETE")))
            headers = functions.ccxtruthy((headers == nothing)) ? Dict{Symbol, Any}() : headers;
            headers[Symbol("Content-Type")] = "application/json";
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(section == "contract", section == "spot2"))
        url = string(get(get(get(self.urls, Symbol("api"), nothing), Symbol(section), nothing), Symbol(access), nothing), "/", self.implodeParams(path, params));
        params = omit(params, self.extractParams(path));
        if functions.ccxtruthy(access == "public")
            if functions.ccxtruthy(length(objectKeys(params)))
                url += string("?", self.urlencode(params));
            end
        else
            self.checkRequiredCredentials();
            timestamp = string(self.nonce());
            auth = "";
            headers = Dict{Symbol, Any}(
                Symbol("ApiKey") => self.apiKey,
                Symbol("Request-Time") => timestamp,
                Symbol("Content-Type") => "application/json",
                Symbol("source") => safeString(self.options, "broker", "CCXT")
            );
            if functions.ccxtruthy(method == "POST")
                auth = json(params);
                body = auth;
            else
                params = keysort(params);
                if functions.ccxtruthy(length(objectKeys(params)))
                    auth += self.urlencode(params);
                    url += string("?", auth);
                end
            end
            auth = string(self.apiKey, timestamp, auth);
            signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
            headers[Symbol("Signature")] = signature;
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Mexc, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    success = self.safeBool(response, "success", false);
    if functions.ccxtruthy(success)
            return nothing
    end
    responseCode = safeString(response, "code");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((responseCode != nothing), (responseCode != "200")), (responseCode != "0")))
        feedback = string(self.id, " ", body);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), responseCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Mexc, name::Symbol) = ccxt_getproperty(self, name)

function Mexc(; kwargs...)
    inst = Mexc(Exchange(), describe, fetchStatus, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, fetchSpotMarkets, fetchSwapMarkets, fetchOrderBook, parseOrderBookBidAsk, fetchTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchTickers, fetchTicker, parseTicker, fetchBidsAsks, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrder, createSpotOrderRequest, createSpotOrder, createSwapOrder, createOrders, fetchOrder, fetchOrders, fetchOrdersByIds, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrdersByState, cancelOrder, cancelOrders, cancelAllOrders, parseOrder, parseOrderSide, parseOrderType, parseOrderStatus, parseOrderTimeInForce, getTifFromRawOrderType, fetchAccountHelper, fetchAccounts, fetchTradingFee, customParseBalance, parseBalanceHelper, fetchBalance, fetchMyTrades, fetchOrderTrades, modifyMarginHelper, reduceMargin, addMargin, setLeverage, fetchFundingHistory, parseFundingRate, fetchFundingInterval, fetchFundingRate, fetchFundingRateHistory, fetchLeverageTiers, parseMarketLeverageTiers, parseDepositAddress, fetchDepositAddressesByNetwork, createDepositAddress, fetchDepositAddress, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatusByType, closeAllPositions, fetchPosition, fetchPositions, parsePosition, fetchTransfer, fetchTransfers, transfer, parseTransfer, parseAccountId, parseTransferStatus, withdraw, setPositionMode, fetchPositionMode, fetchTransactionFees, parseTransactionFees, parseTransactionFee, fetchDepositWithdrawFees, parseDepositWithdrawFee, fetchLeverage, parseLeverage, handleMarginModeAndParams, fetchPositionsHistory, setMarginMode, nonce, sign, handleErrors)
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
