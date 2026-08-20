@kwdef mutable struct Digifinex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchMarketsV2::Function = fetchMarketsV2
    fetchMarketsV1::Function = fetchMarketsV1
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    parseTrade::Function = parseTrade
    fetchTime::Function = fetchTime
    fetchStatus::Function = fetchStatus
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    createOrderRequest::Function = createOrderRequest
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    cancelOrder::Function = cancelOrder
    parseCancelOrders::Function = parseCancelOrders
    cancelOrders::Function = cancelOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    fetchOrder::Function = fetchOrder
    fetchMyTrades::Function = fetchMyTrades
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    fetchTransactionsByType::Function = fetchTransactionsByType
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    parseTransferStatus::Function = parseTransferStatus
    parseTransfer::Function = parseTransfer
    transfer::Function = transfer
    withdraw::Function = withdraw
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    fetchCrossBorrowRate::Function = fetchCrossBorrowRate
    fetchCrossBorrowRates::Function = fetchCrossBorrowRates
    parseBorrowRate::Function = parseBorrowRate
    parseBorrowRates::Function = parseBorrowRates
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingInterval::Function = fetchFundingInterval
    parseFundingRate::Function = parseFundingRate
    parseFundingInterval::Function = parseFundingInterval
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchTradingFee::Function = fetchTradingFee
    parseTradingFee::Function = parseTradingFee
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    parsePosition::Function = parsePosition
    setLeverage::Function = setLeverage
    fetchTransfers::Function = fetchTransfers
    fetchLeverageTiers::Function = fetchLeverageTiers
    fetchMarketLeverageTiers::Function = fetchMarketLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    handleMarginModeAndParams::Function = handleMarginModeAndParams
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFees::Function = parseDepositWithdrawFees
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    setMarginMode::Function = setMarginMode
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicSpotGetMarketSymbols::Function = publicSpotGetMarketSymbols
    publicSpotGetKline::Function = publicSpotGetKline
    publicSpotGetMarginCurrencies::Function = publicSpotGetMarginCurrencies
    publicSpotGetMarginSymbols::Function = publicSpotGetMarginSymbols
    publicSpotGetMarkets::Function = publicSpotGetMarkets
    publicSpotGetOrderBook::Function = publicSpotGetOrderBook
    publicSpotGetPing::Function = publicSpotGetPing
    publicSpotGetSpotSymbols::Function = publicSpotGetSpotSymbols
    publicSpotGetTime::Function = publicSpotGetTime
    publicSpotGetTrades::Function = publicSpotGetTrades
    publicSpotGetTradesSymbols::Function = publicSpotGetTradesSymbols
    publicSpotGetTicker::Function = publicSpotGetTicker
    publicSpotGetCurrencies::Function = publicSpotGetCurrencies
    publicSwapGetPublicApiWeight::Function = publicSwapGetPublicApiWeight
    publicSwapGetPublicCandles::Function = publicSwapGetPublicCandles
    publicSwapGetPublicCandlesHistory::Function = publicSwapGetPublicCandlesHistory
    publicSwapGetPublicDepth::Function = publicSwapGetPublicDepth
    publicSwapGetPublicFundingRate::Function = publicSwapGetPublicFundingRate
    publicSwapGetPublicFundingRateHistory::Function = publicSwapGetPublicFundingRateHistory
    publicSwapGetPublicInstrument::Function = publicSwapGetPublicInstrument
    publicSwapGetPublicInstruments::Function = publicSwapGetPublicInstruments
    publicSwapGetPublicTicker::Function = publicSwapGetPublicTicker
    publicSwapGetPublicTickers::Function = publicSwapGetPublicTickers
    publicSwapGetPublicTime::Function = publicSwapGetPublicTime
    publicSwapGetPublicTrades::Function = publicSwapGetPublicTrades
    privateSpotGetMarketFinancelog::Function = privateSpotGetMarketFinancelog
    privateSpotGetMarketMytrades::Function = privateSpotGetMarketMytrades
    privateSpotGetMarketOrder::Function = privateSpotGetMarketOrder
    privateSpotGetMarketOrderDetail::Function = privateSpotGetMarketOrderDetail
    privateSpotGetMarketOrderCurrent::Function = privateSpotGetMarketOrderCurrent
    privateSpotGetMarketOrderHistory::Function = privateSpotGetMarketOrderHistory
    privateSpotGetMarginAssets::Function = privateSpotGetMarginAssets
    privateSpotGetMarginFinancelog::Function = privateSpotGetMarginFinancelog
    privateSpotGetMarginMytrades::Function = privateSpotGetMarginMytrades
    privateSpotGetMarginOrder::Function = privateSpotGetMarginOrder
    privateSpotGetMarginOrderCurrent::Function = privateSpotGetMarginOrderCurrent
    privateSpotGetMarginOrderHistory::Function = privateSpotGetMarginOrderHistory
    privateSpotGetMarginPositions::Function = privateSpotGetMarginPositions
    privateSpotGetOtcFinancelog::Function = privateSpotGetOtcFinancelog
    privateSpotGetSpotAssets::Function = privateSpotGetSpotAssets
    privateSpotGetSpotFinancelog::Function = privateSpotGetSpotFinancelog
    privateSpotGetSpotMytrades::Function = privateSpotGetSpotMytrades
    privateSpotGetSpotOrder::Function = privateSpotGetSpotOrder
    privateSpotGetSpotOrderCurrent::Function = privateSpotGetSpotOrderCurrent
    privateSpotGetSpotOrderHistory::Function = privateSpotGetSpotOrderHistory
    privateSpotGetDepositAddress::Function = privateSpotGetDepositAddress
    privateSpotGetDepositHistory::Function = privateSpotGetDepositHistory
    privateSpotGetWithdrawHistory::Function = privateSpotGetWithdrawHistory
    privateSpotPostMarketOrderCancel::Function = privateSpotPostMarketOrderCancel
    privateSpotPostMarketOrderNew::Function = privateSpotPostMarketOrderNew
    privateSpotPostMarketOrderBatchNew::Function = privateSpotPostMarketOrderBatchNew
    privateSpotPostMarginOrderCancel::Function = privateSpotPostMarginOrderCancel
    privateSpotPostMarginOrderNew::Function = privateSpotPostMarginOrderNew
    privateSpotPostMarginPositionClose::Function = privateSpotPostMarginPositionClose
    privateSpotPostSpotOrderCancel::Function = privateSpotPostSpotOrderCancel
    privateSpotPostSpotOrderNew::Function = privateSpotPostSpotOrderNew
    privateSpotPostTransfer::Function = privateSpotPostTransfer
    privateSpotPostWithdrawNew::Function = privateSpotPostWithdrawNew
    privateSpotPostWithdrawCancel::Function = privateSpotPostWithdrawCancel
    privateSwapGetAccountBalance::Function = privateSwapGetAccountBalance
    privateSwapGetAccountPositions::Function = privateSwapGetAccountPositions
    privateSwapGetAccountFinanceRecord::Function = privateSwapGetAccountFinanceRecord
    privateSwapGetAccountTradingFeeRate::Function = privateSwapGetAccountTradingFeeRate
    privateSwapGetAccountTransferRecord::Function = privateSwapGetAccountTransferRecord
    privateSwapGetAccountFundingFee::Function = privateSwapGetAccountFundingFee
    privateSwapGetTradeHistoryOrders::Function = privateSwapGetTradeHistoryOrders
    privateSwapGetTradeHistoryTrades::Function = privateSwapGetTradeHistoryTrades
    privateSwapGetTradeOpenOrders::Function = privateSwapGetTradeOpenOrders
    privateSwapGetTradeOrderInfo::Function = privateSwapGetTradeOrderInfo
    privateSwapPostAccountTransfer::Function = privateSwapPostAccountTransfer
    privateSwapPostAccountLeverage::Function = privateSwapPostAccountLeverage
    privateSwapPostAccountPositionMode::Function = privateSwapPostAccountPositionMode
    privateSwapPostAccountPositionMargin::Function = privateSwapPostAccountPositionMargin
    privateSwapPostTradeBatchCancelOrder::Function = privateSwapPostTradeBatchCancelOrder
    privateSwapPostTradeBatchOrder::Function = privateSwapPostTradeBatchOrder
    privateSwapPostTradeCancelOrder::Function = privateSwapPostTradeCancelOrder
    privateSwapPostTradeOrderPlace::Function = privateSwapPostTradeOrderPlace
    privateSwapPostFollowSponsorOrder::Function = privateSwapPostFollowSponsorOrder
    privateSwapPostFollowCloseOrder::Function = privateSwapPostFollowCloseOrder
    privateSwapPostFollowCancelOrder::Function = privateSwapPostFollowCancelOrder
    privateSwapPostFollowUserCenterCurrent::Function = privateSwapPostFollowUserCenterCurrent
    privateSwapPostFollowUserCenterHistory::Function = privateSwapPostFollowUserCenterHistory
    privateSwapPostFollowExpertCurrentOpenOrder::Function = privateSwapPostFollowExpertCurrentOpenOrder
    privateSwapPostFollowAddAlgo::Function = privateSwapPostFollowAddAlgo
    privateSwapPostFollowCancelAlgo::Function = privateSwapPostFollowCancelAlgo
    privateSwapPostFollowAccountAvailable::Function = privateSwapPostFollowAccountAvailable
    privateSwapPostFollowPlanTask::Function = privateSwapPostFollowPlanTask
    privateSwapPostFollowInstrumentList::Function = privateSwapPostFollowInstrumentList

end
function describe(self::Digifinex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "digifinex",
    Symbol("name") => "DigiFinex",
    Symbol("countries") => ["SG"],
    Symbol("version") => "v3",
    Symbol("rateLimit") => 900,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCrossBorrowRate") => true,
        Symbol("fetchCrossBorrowRates") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => true,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarketLeverageTiers") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1",
        Symbol("5m") => "5",
        Symbol("15m") => "15",
        Symbol("30m") => "30",
        Symbol("1h") => "60",
        Symbol("4h") => "240",
        Symbol("12h") => "720",
        Symbol("1d") => "1D",
        Symbol("1w") => "1W"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87443315-01283a00-c5fe-11ea-8628-c2a0feaf07ac.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://openapi.digifinex.com"
        ),
        Symbol("www") => "https://www.digifinex.com",
        Symbol("doc") => ["https://docs.digifinex.com"],
        Symbol("fees") => "https://digifinex.zendesk.com/hc/en-us/articles/360000328422-Fee-Structure-on-DigiFinex",
        Symbol("referral") => "https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("{market}/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order_book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trades/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("public/api_weight") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/candles_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/funding_rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/funding_rate_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("public/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("{market}/financelog") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("{market}/mytrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("{market}/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("{market}/order/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("{market}/order/current") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("{market}/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/financelog") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/mytrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/order/current") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("otc/financelog") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/financelog") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/mytrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/order/current") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("{market}/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("{market}/order/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("{market}/order/batch_new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/order/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/position/close") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/order/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("withdraw/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("withdraw/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/finance_record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/trading_fee_rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/transfer_record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/funding_fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/history_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/history_trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/open_orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/order_info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/position_mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/position_margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/batch_cancel_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/batch_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/cancel_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/order_place") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/sponsor_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/close_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/cancel_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/user_center_current") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/user_center_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/expert_current_open_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/add_algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/cancel_algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/account_available") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/plan_task") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("follow/instrument_list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 500,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 30,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("marketType") => true,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 30,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 500
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 20,
                Symbol("marginMode") => false
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("daysBack") => 100000
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 100
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
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("taker") => self.parseNumber("0.002")
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("10001") => [BadRequest, "Wrong request method, please check it's a GET ot POST request"],
            Symbol("10002") => [AuthenticationError, "Invalid ApiKey"],
            Symbol("10003") => [AuthenticationError, "Sign doesn't match"],
            Symbol("10004") => [BadRequest, "Illegal request parameters"],
            Symbol("10005") => [DDoSProtection, "Request frequency exceeds the limit"],
            Symbol("10006") => [PermissionDenied, "Unauthorized to execute this request"],
            Symbol("10007") => [PermissionDenied, "IP address Unauthorized"],
            Symbol("10008") => [InvalidNonce, "Timestamp for this request is invalid, timestamp must within 1 minute"],
            Symbol("10009") => [NetworkError, "Unexist endpoint, please check endpoint URL"],
            Symbol("10011") => [AccountSuspended, "ApiKey expired. Please go to client side to re-create an ApiKey"],
            Symbol("20001") => [PermissionDenied, "Trade is not open for this trading pair"],
            Symbol("20002") => [PermissionDenied, "Trade of this trading pair is suspended"],
            Symbol("20003") => [InvalidOrder, "Invalid price or amount"],
            Symbol("20007") => [InvalidOrder, "Price precision error"],
            Symbol("20008") => [InvalidOrder, "Amount precision error"],
            Symbol("20009") => [InvalidOrder, "Amount is less than the minimum requirement"],
            Symbol("20010") => [InvalidOrder, "Cash Amount is less than the minimum requirement"],
            Symbol("20011") => [InsufficientFunds, "Insufficient balance"],
            Symbol("20012") => [BadRequest, "Invalid trade type, valid value: buy/sell)"],
            Symbol("20013") => [InvalidOrder, "No order info found"],
            Symbol("20014") => [BadRequest, "Invalid date, Valid format: 2018-07-25)"],
            Symbol("20015") => [BadRequest, "Date exceeds the limit"],
            Symbol("20018") => [PermissionDenied, "Your trading rights have been banned by the system"],
            Symbol("20019") => [BadSymbol, "Wrong trading pair symbol. Correct format:\"usdt_btc\". Quote asset is in the front"],
            Symbol("20020") => [DDoSProtection, "You have violated the API operation trading rules and temporarily forbid trading. At present, we have certain restrictions on the user's transaction rate and withdrawal rate."],
            Symbol("50000") => [ExchangeError, "Exception error"],
            Symbol("20021") => [BadRequest, "Invalid currency"],
            Symbol("20022") => [BadRequest, "The ending timestamp must be larger than the starting timestamp"],
            Symbol("20023") => [BadRequest, "Invalid transfer type"],
            Symbol("20024") => [BadRequest, "Invalid amount"],
            Symbol("20025") => [BadRequest, "This currency is not transferable at the moment"],
            Symbol("20026") => [InsufficientFunds, "Transfer amount exceed your balance"],
            Symbol("20027") => [PermissionDenied, "Abnormal account status"],
            Symbol("20028") => [PermissionDenied, "Blacklist for transfer"],
            Symbol("20029") => [PermissionDenied, "Transfer amount exceed your daily limit"],
            Symbol("20030") => [BadRequest, "You have no position on this trading pair"],
            Symbol("20032") => [PermissionDenied, "Withdrawal limited"],
            Symbol("20033") => [BadRequest, "Wrong Withdrawal ID"],
            Symbol("20034") => [PermissionDenied, "Withdrawal service of this crypto has been closed"],
            Symbol("20035") => [PermissionDenied, "Withdrawal limit"],
            Symbol("20036") => [ExchangeError, "Withdrawal cancellation failed"],
            Symbol("20037") => [InvalidAddress, "The withdrawal address, Tag or chain type is not included in the withdrawal management list"],
            Symbol("20038") => [InvalidAddress, "The withdrawal address is not on the white list"],
            Symbol("20039") => [ExchangeError, "Can't be canceled in current status"],
            Symbol("20040") => [RateLimitExceeded, "Withdraw too frequently; limitation: 3 times a minute, 100 times a day"],
            Symbol("20041") => [PermissionDenied, "Beyond the daily withdrawal limit"],
            Symbol("20042") => [BadSymbol, "Current trading pair does not support API trading"],
            Symbol("400002") => [BadRequest, "Invalid Parameter"]
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "spot",
        Symbol("types") => ["spot", "margin", "otc"],
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "1",
            Symbol("margin") => "2",
            Symbol("OTC") => "3"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ARBITRUM") => "Arbitrum",
            Symbol("AVALANCEC") => "AVAX-CCHAIN",
            Symbol("AVALANCEX") => "AVAX-XCHAIN",
            Symbol("BEP20") => "BEP20",
            Symbol("BSC") => "BEP20",
            Symbol("CARDANO") => "Cardano",
            Symbol("CELO") => "Celo",
            Symbol("CHILIZ") => "Chiliz",
            Symbol("COSMOS") => "COSMOS",
            Symbol("CRC20") => "Crypto.com",
            Symbol("CRONOS") => "Crypto.com",
            Symbol("DOGECOIN") => "DogeChain",
            Symbol("ERC20") => "ERC20",
            Symbol("ETH") => "ERC20",
            Symbol("ETHW") => "ETHW",
            Symbol("IOTA") => "MIOTA",
            Symbol("KLAYTN") => "KLAY",
            Symbol("METIS") => "MetisDAO",
            Symbol("MOONBEAM") => "GLMR",
            Symbol("MOONRIVER") => "Moonriver",
            Symbol("OPTIMISM") => "OPETH",
            Symbol("POLYGON") => "Polygon",
            Symbol("MATIC") => "Polygon",
            Symbol("RIPPLE") => "XRP",
            Symbol("SOL") => "SOL",
            Symbol("XLM") => "Stella",
            Symbol("TERRACLASSIC") => "TerraClassic",
            Symbol("TERRA") => "Terra",
            Symbol("TON") => "Ton",
            Symbol("TRC20") => "TRC20",
            Symbol("TRX") => "TRC20",
            Symbol("VECHAIN") => "Vechain"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("TRC20") => "TRC20",
            Symbol("TRX") => "TRC20",
            Symbol("BEP20") => "BEP20",
            Symbol("BSC") => "BEP20",
            Symbol("ERC20") => "ERC20",
            Symbol("ETH") => "ERC20",
            Symbol("Polygon") => "POLYGON",
            Symbol("Crypto.com") => "CRONOS"
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("BHT") => "Black House Test",
        Symbol("EPS") => "Epanus",
        Symbol("FREE") => "FreeRossDAO",
        Symbol("MBN") => "Mobilian Coin",
        Symbol("TEL") => "TEL666"
    )
))

end
"""
fetches all available currencies on an exchange
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-currency-deposit-and-withdrawal-information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Digifinex; params=Dict())
    response = Base.fetch(self.publicSpotGetCurrencies(params));
    data = self.safeList(response, "data", defaultValue = []);
    groupedById = groupBy(data, "currency");
    values_var = objectValues(groupedById);
    return self.parseCurrencies(values_var)

end
function parseCurrency(self::Digifinex, rawCurrency)
    networkEntries = rawCurrency;
    firstEntry = self.safeDict(networkEntries, 0, defaultValue = Dict{Symbol, Any}());
    id = safeString(firstEntry, "currency");
    code = self.safeCurrencyCode(id);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkEntries)))
        networkEntry = get(networkEntries, j + 1, nothing);
        networkId = safeString2(networkEntry, "chain", "currency");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("deposit") => safeInteger(networkEntry, "deposit_status") == 1,
                Symbol("withdraw") => safeInteger(networkEntry, "withdraw_status") == 1,
                Symbol("fee") => self.safeNumber(networkEntry, "min_withdraw_fee"),
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkEntry, "min_withdraw_amount"),
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkEntry, "min_deposit_amount"),
                        Symbol("max") => nothing
                    )
                ),
                Symbol("info") => networkEntry
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => networkEntries,
    Symbol("networks") => networks
))

end
"""
retrieves data on all markets for digifinex
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#all-the-market-description
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#spot-trading-pair-symbol
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-trading-pair-symbol
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Digifinex; params=Dict())
    options = safeValue(self.options, "fetchMarkets", Dict{Symbol, Any}());
    method = safeString(options, "method", "fetch_markets_v2");
    if functions.ccxtruthy(method == "fetch_markets_v2")
            return Base.fetch(self.fetchMarketsV2(params = params))
    end
    return Base.fetch(self.fetchMarketsV1(params = params))

end
function fetchMarketsV2(self::Digifinex; params=Dict())
    defaultType = safeString(self.options, "defaultType");
    (marginMode, query) = self.handleMarginModeAndParams("fetchMarketsV2", params = params);
    promisesRaw = [];
    if functions.ccxtruthy(marginMode != nothing)
                push!(promisesRaw, self.publicSpotGetMarginSymbols(query));
    else
        push!(promisesRaw, self.publicSpotGetTradesSymbols(query));
    end
    push!(promisesRaw, self.publicSwapGetPublicInstruments(params));
    promises = Base.fetch(asyncmap(Base.fetch, promisesRaw));
    spotMarkets = get(promises, 1, nothing);
    swapMarkets = get(promises, 2, nothing);
    spotData = safeValue(spotMarkets, "symbol_list", []);
    swapData = safeValue(swapMarkets, "data", []);
    response = arrayConcat(spotData, swapData);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        market = get(response, i + 1, nothing);
        id = safeString2(market, "symbol", "instrument_id");
        baseId = safeString2(market, "base_asset", "base_currency");
        quoteId = safeString2(market, "quote_asset", "quote_currency");
        settleId = safeString(market, "clear_currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        isAllowed = safeInteger(market, "is_allow", 1);
        type_var = functions.ccxtruthy((defaultType == "margin")) ? "margin" : "spot";
        spot = settle == nothing;
        swap = !functions.ccxtruthy(spot);
        margin = functions.ccxtruthy((marginMode != nothing)) ? true : nothing;
        symbol = string(base, "/", quote_var);
        isInverse = nothing;
        isLinear = nothing;
        if functions.ccxtruthy(swap)
            type_var = "swap";
            symbol = string(base, "/", quote_var, ":", settle);
            isInverse = safeValue(market, "is_inverse");
            isLinear = functions.ccxtruthy((!functions.ccxtruthy(isInverse))) ? true : false;
            isTrading = safeValue(market, "isTrading");
            if functions.ccxtruthy(isTrading)
                isAllowed = 1;
            end
        end
        isActive = functions.ccxtruthy(isAllowed) ? true : false;
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
    Symbol("margin") => margin,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => isActive,
    Symbol("contract") => swap,
    Symbol("linear") => isLinear,
    Symbol("inverse") => isInverse,
    Symbol("contractSize") => self.safeNumber(market, "contract_value"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "amount_precision"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "price_precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber2(market, "minimum_amount", "min_order_amount"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "tick_size"),
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minimum_value"),
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
function fetchMarketsV1(self::Digifinex; params=Dict())
    response = Base.fetch(self.publicSpotGetMarkets(params));
    markets = safeValue(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "market");
        if functions.ccxtruthy(id == nothing)
            throw(ExchangeError(string(self.id, " fetchMarketsV1() missing id")));
        end
        (baseId, quoteId) = split(id, "_");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
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
    Symbol("margin") => nothing,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => nothing,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "price_precision"))),
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "volume_precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_volume"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_amount"),
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function parseBalance(self::Digifinex, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        free = safeString2(balance, "free", "avail_balance");
        total = safeString2(balance, "total", "equity");
        account[Symbol("free")] = free;
        account[Symbol("used")] = stringSub(total, free);
        account[Symbol("total")] = total;
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#spot-account-assets
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#accountbalance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Digifinex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    (marginMode, query) = self.handleMarginModeAndParams("fetchBalance", params = params);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(marginMode != nothing, marketType == "margin"))
        marketType = "margin";
        response = Base.fetch(self.privateSpotGetMarginAssets(query));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateSpotGetSpotAssets(query));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateSwapGetAccountBalance(query));
        else
            throw(NotSupported(string(self.id, " fetchBalance() not support this market type")));
        end

    end
    balanceRequest = functions.ccxtruthy((marketType == "swap")) ? "data" : "list";
    balances = safeValue(response, balanceRequest, []);
    return self.parseBalance(balances)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-orderbook
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Digifinex, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (marketType, query) = self.handleMarketTypeAndParams("fetchOrderBook", market = market, params = params);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(marketType == "swap")
        request[Symbol("instrument_id")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicSwapGetPublicDepth(extend(request, query)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicSpotGetOrderBook(extend(request, query)));
    end
    timestamp = nothing;
    orderBook = nothing;
    if functions.ccxtruthy(marketType == "swap")
        orderBook = safeValue(response, "data", Dict{Symbol, Any}());
        timestamp = safeInteger(orderBook, "timestamp");
    else
        orderBook = response;
        timestamp = safeTimestamp(response, "date");
    end
    return self.parseOrderBook(orderBook, get(market, Symbol("symbol"), nothing), timestamp = timestamp)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#ticker-price
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Digifinex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    first_var = safeString(symbols, 0);
    market = nothing;
    if functions.ccxtruthy(first_var != nothing)
        market = self.market(first_var);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.publicSwapGetPublicTickers(extend(request, params)));
    else
        response = Base.fetch(self.publicSpotGetTicker(extend(request, params)));
    end
    result = Dict{Symbol, Any}();
    tickers = safeValue2(response, "ticker", "data", []);
    date = safeInteger(response, "date");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        rawTicker = extend(Dict{Symbol, Any}(
            Symbol("date") => date
        ), get(tickers, i + 1, nothing));
        ticker = self.parseTicker(rawTicker);
        symbol = get(ticker, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#ticker-price
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Digifinex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("instrument_id")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicSwapGetPublicTicker(extend(request, params)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicSpotGetTicker(extend(request, params)));
    end
    date = safeInteger(response, "date");
    tickers = safeValue(response, "ticker", []);
    data = safeValue(response, "data", Dict{Symbol, Any}());
    firstTicker = safeValue(tickers, 0, Dict{Symbol, Any}());
    result = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        result = data;
    else
        result = extend(Dict{Symbol, Any}(
    Symbol("date") => date
), firstTicker);
    end
    if functions.ccxtruthy(result == nothing)
        throw(NullResponse(string(self.id, " fetchTicker() returned empty response")));
    end
    return self.parseTicker(result, market = market)

end
function parseTicker(self::Digifinex, ticker; market=nothing)
    indexPrice = self.safeNumber(ticker, "index_price");
    marketType = functions.ccxtruthy((indexPrice != nothing)) ? "contract" : "spot";
    marketId = safeStringUpper2(ticker, "symbol", "instrument_id");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = marketType);
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
    timestamp = safeTimestamp(ticker, "date");
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        timestamp = safeInteger(ticker, "timestamp");
    end
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(ticker, "high", "high_24h"),
    Symbol("low") => safeString2(ticker, "low", "low_24h"),
    Symbol("bid") => safeString2(ticker, "buy", "best_bid"),
    Symbol("bidVolume") => safeString(ticker, "best_bid_size"),
    Symbol("ask") => safeString2(ticker, "sell", "best_ask"),
    Symbol("askVolume") => safeString(ticker, "best_ask_size"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open_24h"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString2(ticker, "change", "price_change_percent"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString2(ticker, "vol", "volume_24h"),
    Symbol("quoteVolume") => safeString(ticker, "base_vol"),
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("indexPrice") => indexPrice,
    Symbol("info") => ticker
), market = market)

end
function parseTrade(self::Digifinex, trade; market=nothing)
    id = safeString2(trade, "id", "trade_id");
    orderId = safeString(trade, "order_id");
    priceString = safeString(trade, "price");
    amountString = safeStringN(trade, ["amount", "volume", "size"]);
    marketId = safeStringUpper2(trade, "symbol", "instrument_id");
    symbol = self.safeSymbol(marketId, market = market);
    if functions.ccxtruthy(market == nothing)
        market = self.safeMarket(marketId = marketId);
    end
    timestamp = safeTimestamp2(trade, "date", "timestamp");
    side = safeString2(trade, "type", "side");
    type_var = nothing;
    takerOrMaker = nothing;
    if functions.ccxtruthy(get(market, Symbol("type"), nothing) == "swap")
        timestamp = safeInteger(trade, "trade_time");
        orderType = safeString(trade, "order_type");
        tradeRole = safeString(trade, "match_role");
        direction = safeString(trade, "direction");
        if functions.ccxtruthy(orderType != nothing)
            type_var = functions.ccxtruthy((orderType == "0")) ? "limit" : nothing;
        end
        if functions.ccxtruthy(tradeRole == "1")
            takerOrMaker = "taker";
        elseif functions.ccxtruthy(tradeRole == "2")
            takerOrMaker = "maker";
        else
            takerOrMaker = nothing;
        end
        if functions.ccxtruthy(@functions.ccxt_or((side == "1"), (direction == "1")))
            side = "buy";
        elseif functions.ccxtruthy(@functions.ccxt_or((side == "2"), (direction == "2")))
            side = "sell";
        else
            if functions.ccxtruthy(@functions.ccxt_or((side == "3"), (direction == "3")))
                side = "sell";
            elseif functions.ccxtruthy(@functions.ccxt_or((side == "4"), (direction == "4")))
                side = "buy";
            end

        end
    else
        if functions.ccxtruthy(side == nothing)
            throw(ExchangeError(string(self.id, " parseTrade() returned no side")));
        end
        parts = split(side, "_");
        side = safeString(parts, 0);
        type_var = safeString(parts, 1);
        if functions.ccxtruthy(type_var == nothing)
            type_var = "limit";
        end
        isMaker = safeValue(trade, "is_maker");
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    end
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "fee_currency");
        feeCurrencyCode = nothing;
        if functions.ccxtruthy(feeCurrencyId != nothing)
            feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("order") => orderId,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("fee") => fee
), market = market)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#server-timestamp

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Digifinex; params=Dict())
    response = Base.fetch(self.publicSpotGetTime(params));
    return safeTimestamp(response, "server_time")

end
"""
the latest known information on the availability of the exchange API
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#server-ping

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Digifinex; params=Dict())
    response = Base.fetch(self.publicSpotGetPing(params));
    code = safeInteger(response, "code");
    status = functions.ccxtruthy((code == 0)) ? "ok" : "maintenance";
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-recent-trades
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#recenttrades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Digifinex, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = functions.ccxtruthy(get(market, Symbol("swap"), nothing)) ? min(limit, 100) : limit;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("instrument_id")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicSwapGetPublicTrades(extend(request, params)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicSpotGetTrades(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
function parseOHLCV(self::Digifinex, ohlcv; market=nothing)
    if functions.ccxtruthy(self.safeBool(market, "swap"))
            return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]
    else
        return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 5), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 1)]
    end

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-candles-data
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#recentcandle

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Digifinex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("instrument_id")] = get(market, Symbol("id"), nothing);
        request[Symbol("granularity")] = timeframe;
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = min(limit, 100);
        end
        response = Base.fetch(self.publicSwapGetPublicCandles(extend(request, params)));
    else
        until = safeInteger(params, "until");
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("period")] = safeString(self.timeframes, timeframe, timeframe);
        startTime = since;
        duration = self.parseTimeframe(timeframe);
        if functions.ccxtruthy(startTime == nothing)
            if functions.ccxtruthy(@functions.ccxt_or((limit != nothing), (until != nothing)))
                endTime = functions.ccxtruthy((until != nothing)) ? until : milliseconds();
                startLimit = functions.ccxtruthy((limit != nothing)) ? limit : 200;
                startTime = endTime - (startLimit * duration * 1000);
            end
        end
        if functions.ccxtruthy(startTime != nothing)
            startTime = self.parseToInt(startTime / 1000);
            request[Symbol("start_time")] = startTime;
            if functions.ccxtruthy(@functions.ccxt_or((limit != nothing), (until != nothing)))
                if functions.ccxtruthy(until != nothing)
                    endByUntil = self.parseToInt(until / 1000);
                    if functions.ccxtruthy(limit != nothing)
                        endByLimit = self.sum(startTime, limit * duration);
                        request[Symbol("end_time")] = min(endByLimit, endByUntil);
                    else
                        request[Symbol("end_time")] = endByUntil;
                    end
                else
                    if functions.ccxtruthy(limit == nothing)
                        throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a limit argument")));
                    end
                    request[Symbol("end_time")] = self.sum(startTime, limit * duration);
                end
            end
        end
        params = omit(params, "until");
        response = Base.fetch(self.publicSpotGetKline(extend(request, params)));
    end
    candles = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        data = safeValue(response, "data", Dict{Symbol, Any}());
        candles = safeValue(data, "candles", []);
    else
        candles = safeValue(response, "data", []);
    end
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
create a trade order
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-new-order
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderplace

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency, spot market orders use the quote currency, swap requires the number of contracts
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: "GTC", "IOC", "FOK", or "PO"
- `params.postOnly`::bool, optional: true or false
- `params.reduceOnly`::bool, optional: true or false
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Digifinex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginResult = self.handleMarginModeAndParams("createOrder", params = params);
    marginMode = get(marginResult, 1, nothing);
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateSwapPostTradeOrderPlace(request));
    else
        if functions.ccxtruthy(marginMode != nothing)
            response = Base.fetch(self.privateSpotPostMarginOrderNew(request));
        else
            response = Base.fetch(self.privateSpotPostSpotOrderNew(request));
        end
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " createOrder() returned empty response")));
    end
    order = self.parseOrder(response, market = market);
    order[Symbol("symbol")] = get(market, Symbol("symbol"), nothing);
    order[Symbol("type")] = type_var;
    order[Symbol("side")] = side;
    order[Symbol("amount")] = amount;
    order[Symbol("price")] = price;
    return order

end
"""
create a list of trade orders (all orders should be of the same symbol)
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-multiple-order
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#batchorder

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Digifinex, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    symbol = nothing;
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
        marginResult = self.handleMarginModeAndParams("createOrders", params = orderParams);
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
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateSwapPostTradeBatchOrder(ordersRequests));
    else
        request[Symbol("market")] = functions.ccxtruthy((marginMode != nothing)) ? "margin" : "spot";
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("list")] = json(ordersRequests);
        response = Base.fetch(self.privateSpotPostMarketOrderBatchNew(request));
    end
    data = [];
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        data = safeValue(response, "data", []);
    else
        data = safeValue(response, "order_ids", []);
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        individualOrder = Dict{Symbol, Any}();
        individualOrder[Symbol("order_id")] = get(data, i + 1, nothing);
        individualOrder[Symbol("instrument_id")] = get(market, Symbol("id"), nothing);
        individualOrder[Symbol("amount")] = self.safeNumber(rawOrder, "amount");
        individualOrder[Symbol("price")] = self.safeNumber(rawOrder, "price");
        push!(result, individualOrder);
        i += 1
    end
    return self.parseOrders(result, market = market)

end
function createOrderRequest(self::Digifinex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("createOrderRequest", market = market, params = params);
    (marginMode, params) = self.handleMarginModeAndParams("createOrderRequest", params = params);
    if functions.ccxtruthy(marginMode != nothing)
        marketType = "margin";
    end
    request = Dict{Symbol, Any}();
    swap = (marketType == "swap");
    isMarketOrder = (type_var == "market");
    isLimitOrder = (type_var == "limit");
    marketIdRequest = functions.ccxtruthy(swap) ? "instrument_id" : "symbol";
    request[Symbol(marketIdRequest)] = get(market, Symbol("id"), nothing);
    postOnly = self.isPostOnly(isMarketOrder, false, params = params);
    postOnlyParsed = nothing;
    if functions.ccxtruthy(swap)
        reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
        timeInForce = safeString(params, "timeInForce");
        orderType = nothing;
        if functions.ccxtruthy(side == "buy")
            requestType = functions.ccxtruthy((reduceOnly)) ? 4 : 1;
            request[Symbol("type")] = requestType;
        else
            requestType = functions.ccxtruthy((reduceOnly)) ? 3 : 2;
            request[Symbol("type")] = requestType;
        end
        if functions.ccxtruthy(isLimitOrder)
            orderType = 0;
        end
        if functions.ccxtruthy(timeInForce == "FOK")
            orderType = functions.ccxtruthy(isMarketOrder) ? 15 : 9;
        elseif functions.ccxtruthy(timeInForce == "IOC")
            orderType = functions.ccxtruthy(isMarketOrder) ? 13 : 4;
        else
            if functions.ccxtruthy(@functions.ccxt_or((timeInForce == "GTC"), (isMarketOrder)))
                orderType = 14;
            elseif functions.ccxtruthy(timeInForce == "PO")
                postOnly = true;
            end

        end
        if functions.ccxtruthy(price != nothing)
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
        request[Symbol("order_type")] = orderType;
        request[Symbol("size")] = amount;
        params = omit(params, ["reduceOnly", "timeInForce"]);
    else
        postOnlyParsed = functions.ccxtruthy((postOnly)) ? 1 : 2;
        request[Symbol("market")] = marketType;
        suffix = "";
        if functions.ccxtruthy(type_var == "market")
            suffix = "_market";
        else
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
        request[Symbol("type")] = string(side, suffix);
        quantity = nothing;
        createMarketBuyOrderRequiresPrice = true;
        (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrderRequest", "createMarketBuyOrderRequiresPrice", defaultValue = true);
        if functions.ccxtruthy(@functions.ccxt_and(isMarketOrder, (side == "buy")))
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(cost != nothing)
                quantity = self.costToPrecision(symbol, cost);
            elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(price == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires a price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    costRequest = self.parseNumber(stringMul(amountString, priceString));
                    quantity = self.costToPrecision(symbol, costRequest);
                end
            else
                quantity = self.costToPrecision(symbol, amount);
            end
        else
            quantity = self.amountToPrecision(symbol, amount);
        end
        request[Symbol("amount")] = quantity;
    end
    if functions.ccxtruthy(postOnly)
        if functions.ccxtruthy(postOnlyParsed)
            request[Symbol("post_only")] = postOnlyParsed;
        else
            request[Symbol("post_only")] = postOnly;
        end
    end
    params = omit(params, ["postOnly"]);
    return extend(request, params)

end
"""
create a market buy order by providing the symbol and cost
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-new-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Digifinex, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    params[Symbol("createMarketBuyOrderRequiresPrice")] = false;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = params))

end
"""
cancels an open order
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#cancel-order
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#cancelorder

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Digifinex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    id = string(id);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrder", market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    if functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
        end
        request[Symbol("instrument_id")] = safeString(market, "id");
    else
        request[Symbol("market")] = marketType;
    end
    (marginMode, query) = self.handleMarginModeAndParams("cancelOrder", params = params);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(marginMode != nothing, marketType == "margin"))
        marketType = "margin";
        response = Base.fetch(self.privateSpotPostMarginOrderCancel(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateSpotPostSpotOrderCancel(extend(request, query)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateSwapPostTradeCancelOrder(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " cancelOrder() not support this market type")));
        end

    end
    if functions.ccxtruthy(@functions.ccxt_or((marketType == "spot"), (marketType == "margin")))
        canceledOrders = safeValue(response, "success", []);
        numCanceledOrders = length(canceledOrders);
        if functions.ccxtruthy(numCanceledOrders != 1)
            throw(OrderNotFound(string(self.id, " cancelOrder() ", id, " not found")));
        end
        orders = self.parseCancelOrders(response);
            return self.safeDict(orders, 0)
    else
        return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("orderId") => safeString(response, "data")
))
    end

end
function parseCancelOrders(self::Digifinex, response)
    success = self.safeList(response, "success", defaultValue = []);
    error = self.safeList(response, "error", defaultValue = []);
    result = [];
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
    while functions.ccxtruthy(functions.ccxt_lt(i, length(error)))
        order = get(error, i + 1, nothing);
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
"""
cancel multiple orders
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#cancel-order

# Arguments
- `ids`::array: order ids
- `symbol`::string: not used by cancelOrders ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Digifinex, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    defaultType = safeString(self.options, "defaultType", "spot");
    orderType = safeString(params, "type", defaultType);
    params = omit(params, "type");
    request = Dict{Symbol, Any}(
        Symbol("market") => orderType,
        Symbol("order_id") => join(ids, ",")
    );
    response = Base.fetch(self.privateSpotPostSpotOrderCancel(extend(request, params)));
    return self.parseCancelOrders(response)

end
function parseOrderStatus(self::Digifinex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "open",
        Symbol("1") => "open",
        Symbol("2") => "closed",
        Symbol("3") => "canceled",
        Symbol("4") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Digifinex, order; market=nothing)
    timestamp = nothing;
    lastTradeTimestamp = nothing;
    timeInForce = nothing;
    type_var = nothing;
    side = safeString(order, "type");
    marketId = safeString2(order, "symbol", "instrument_id");
    symbol = self.safeSymbol(marketId, market = market);
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("type"), nothing) == "swap")
        orderType = safeInteger(order, "order_type");
        if functions.ccxtruthy(orderType != nothing)
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((orderType == 9), (orderType == 10)), (orderType == 11)), (orderType == 12)), (orderType == 15)))
                timeInForce = "FOK";
            elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((orderType == 1), (orderType == 2)), (orderType == 3)), (orderType == 4)), (orderType == 13)))
                timeInForce = "IOC";
            else
                if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((orderType == 6), (orderType == 7)), (orderType == 8)), (orderType == 14)))
                    timeInForce = "GTC";
                end

            end
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((orderType == 0), (orderType == 1)), (orderType == 4)), (orderType == 5)), (orderType == 9)), (orderType == 10)))
                type_var = "limit";
            else
                type_var = "market";
            end
        end
        if functions.ccxtruthy(side == "1")
            side = "open long";
        elseif functions.ccxtruthy(side == "2")
            side = "open short";
        else
            if functions.ccxtruthy(side == "3")
                side = "close long";
            elseif functions.ccxtruthy(side == "4")
                side = "close short";
            end

        end
        timestamp = safeInteger(order, "insert_time");
        lastTradeTimestamp = safeInteger(order, "time_stamp");
    else
        timestamp = safeTimestamp(order, "created_date");
        lastTradeTimestamp = safeTimestamp(order, "finished_date");
        if functions.ccxtruthy(side != nothing)
            parts = split(side, "_");
            numParts = length(parts);
            if functions.ccxtruthy(functions.ccxt_gt(numParts, 1))
                side = get(parts, 1, nothing);
                type_var = get(parts, 2, nothing);
            else
                type_var = "limit";
            end
        end
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString2(order, "order_id", "data"),
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => self.safeNumber(order, "price"),
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => self.safeNumber2(order, "amount", "size"),
    Symbol("filled") => self.safeNumber2(order, "executed_amount", "filled_qty"),
    Symbol("remaining") => nothing,
    Symbol("cost") => nothing,
    Symbol("average") => self.safeNumber2(order, "avg_price", "price_avg"),
    Symbol("status") => self.parseOrderStatus(safeString2(order, "status", "state")),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.safeNumber(order, "fee")
    ),
    Symbol("trades") => nothing
), market = market)

end
"""
fetch all unfilled currently open orders
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#current-active-orders
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#openorder

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Digifinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market = market, params = params);
    (marginMode, query) = self.handleMarginModeAndParams("fetchOpenOrders", params = params);
    request = Dict{Symbol, Any}();
    swap = (marketType == "swap");
    if functions.ccxtruthy(swap)
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_timestamp")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
    else
        request[Symbol("market")] = marketType;
    end
    if functions.ccxtruthy(market != nothing)
        marketIdRequest = functions.ccxtruthy(swap) ? "instrument_id" : "symbol";
        request[Symbol(marketIdRequest)] = get(market, Symbol("id"), nothing);
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(marginMode != nothing, marketType == "margin"))
        marketType = "margin";
        response = Base.fetch(self.privateSpotGetMarginOrderCurrent(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateSpotGetSpotOrderCurrent(extend(request, query)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateSwapGetTradeOpenOrders(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " fetchOpenOrders() not support this market type")));
        end

    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-all-orders-including-history-orders
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#historyorder

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Digifinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrders", market = market, params = params);
    (marginMode, query) = self.handleMarginModeAndParams("fetchOrders", params = params);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_timestamp")] = since;
        end
    else
        request[Symbol("market")] = marketType;
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_time")] = self.parseToInt(since / 1000);
        end
    end
    if functions.ccxtruthy(market != nothing)
        marketIdRequest = functions.ccxtruthy((marketType == "swap")) ? "instrument_id" : "symbol";
        request[Symbol(marketIdRequest)] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(marginMode != nothing, marketType == "margin"))
        marketType = "margin";
        response = Base.fetch(self.privateSpotGetMarginOrderHistory(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateSpotGetSpotOrderHistory(extend(request, query)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateSwapGetTradeHistoryOrders(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " fetchOrders() not support this market type")));
        end

    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches information on an order made by the user
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-order-status
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderinfo

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Digifinex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrder", market = market, params = params);
    (marginMode, query) = self.handleMarginModeAndParams("fetchOrder", params = params);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    if functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(market != nothing)
            request[Symbol("instrument_id")] = get(market, Symbol("id"), nothing);
        end
    else
        request[Symbol("market")] = marketType;
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((marginMode != nothing), (marketType == "margin")))
        marketType = "margin";
        response = Base.fetch(self.privateSpotGetMarginOrder(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateSpotGetSpotOrder(extend(request, query)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateSwapGetTradeOrderInfo(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " fetchOrder() not support this market type")));
        end

    end
    data = safeValue(response, "data");
    order = functions.ccxtruthy((marketType == "swap")) ? data : safeValue(data, 0);
    if functions.ccxtruthy(order == nothing)
        throw(OrderNotFound(string(self.id, " fetchOrder() order ", id, " not found")));
    end
    return self.parseOrder(order, market = market)

end
"""
fetch all trades made by the user
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#customer-39-s-trades
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#historytrade

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Digifinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params);
    (marginMode, query) = self.handleMarginModeAndParams("fetchMyTrades", params = params);
    if functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_timestamp")] = since;
        end
    else
        request[Symbol("market")] = marketType;
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_time")] = self.parseToInt(since / 1000);
        end
    end
    marketIdRequest = functions.ccxtruthy((marketType == "swap")) ? "instrument_id" : "symbol";
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol(marketIdRequest)] = safeString(market, "id");
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(marginMode != nothing, marketType == "margin"))
        marketType = "margin";
        response = Base.fetch(self.privateSpotGetMarginMytrades(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateSpotGetSpotMytrades(extend(request, query)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateSwapGetTradeHistoryTrades(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " fetchMyTrades() not support this market type")));
        end

    end
    responseRequest = functions.ccxtruthy((marketType == "swap")) ? "data" : "list";
    data = self.safeList(response, responseRequest, defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
function parseLedgerEntryType(self::Digifinex, type_var)
    types = Dict{Symbol, Any}();
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Digifinex, item; currency=nothing)
    type_var = self.parseLedgerEntryType(safeString2(item, "type", "finance_type"));
    currencyId = safeString2(item, "currency_mark", "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    amount = self.safeNumber2(item, "num", "change");
    after = self.safeNumber(item, "balance");
    timestamp = safeTimestamp(item, "time");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeInteger(item, "timestamp");
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => nothing,
    Symbol("direction") => nothing,
    Symbol("account") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("before") => nothing,
    Symbol("after") => after,
    Symbol("status") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => nothing
), currency = currency)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#spot-margin-otc-financial-logs
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#bills

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Digifinex; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchLedger", market = nothing, params = params);
    (marginMode, query) = self.handleMarginModeAndParams("fetchLedger", params = params);
    if functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_timestamp")] = since;
        end
    else
        request[Symbol("market")] = marketType;
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_time")] = self.parseToInt(since / 1000);
        end
    end
    currencyIdRequest = functions.ccxtruthy((marketType == "swap")) ? "currency" : "currency_mark";
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol(currencyIdRequest)] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(marginMode != nothing, marketType == "margin"))
        marketType = "margin";
        response = Base.fetch(self.privateSpotGetMarginFinancelog(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateSpotGetSpotFinancelog(extend(request, query)));
    else
        if functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.privateSwapGetAccountFinanceRecord(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " fetchLedger() not support this market type")));
        end

    end
    ledger = nothing;
    if functions.ccxtruthy(marketType == "swap")
        ledger = safeValue(response, "data", []);
    else
        data = safeValue(response, "data", Dict{Symbol, Any}());
        ledger = safeValue(data, "finance", []);
    end
    return self.parseLedger(ledger, currency = currency, since = since, limit = limit)

end
function parseDepositAddress(self::Digifinex, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    tag = safeString(depositAddress, "addressTag");
    currencyId = safeStringUpper(depositAddress, "currency");
    code = self.safeCurrencyCode(currencyId);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#deposit-address-inquiry

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Digifinex, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateSpotGetDepositAddress(extend(request, params)));
    data = safeValue(response, "data", []);
    addresses = self.parseDepositAddresses(data, codes = [get(currency, Symbol("code"), nothing)]);
    address = safeValue(addresses, code);
    if functions.ccxtruthy(address == nothing)
        throw(InvalidAddress(string(self.id, " fetchDepositAddress() did not return an address for ", code, " - create the deposit address in the user settings on the exchange website first.")));
    end
    return address

end
function fetchTransactionsByType(self::Digifinex, type_var; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(500, limit);
    end
    response = nothing;
    if functions.ccxtruthy(type_var == "deposit")
        response = Base.fetch(self.privateSpotGetDepositHistory(extend(request, params)));
    else
        response = Base.fetch(self.privateSpotGetWithdrawHistory(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => type_var
))

end
"""
fetch all deposits made to an account
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#deposit-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Digifinex; code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsByType("deposit", code = code, since = since, limit = limit, params = params))

end
"""
fetch all withdrawals made from an account
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#withdrawal-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Digifinex; code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsByType("withdrawal", code = code, since = since, limit = limit, params = params))

end
function parseTransactionStatus(self::Digifinex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("1") => "pending",
        Symbol("2") => "pending",
        Symbol("3") => "ok",
        Symbol("4") => "failed"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Digifinex, transaction; currency=nothing)
    id = safeString2(transaction, "id", "withdraw_id");
    address = safeString(transaction, "address");
    tag = safeString(transaction, "memo");
    txid = safeString(transaction, "hash");
    currencyId = safeStringUpper(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = self.parse8601(safeString(transaction, "created_date"));
    updated = self.parse8601(safeString(transaction, "finished_date"));
    status = self.parseTransactionStatus(safeString(transaction, "state"));
    amount = self.safeNumber(transaction, "amount");
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    network = safeString(transaction, "chain");
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
    Symbol("tag") => tag,
    Symbol("tagTo") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("type") => nothing,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => fee
)

end
function parseTransferStatus(self::Digifinex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransfer(self::Digifinex, transfer; currency=nothing)
    fromAccount = nothing;
    toAccount = nothing;
    data = self.safeDict(transfer, "data", defaultValue = transfer);
    type_var = safeInteger(data, "type");
    if functions.ccxtruthy(type_var == 1)
        fromAccount = "spot";
        toAccount = "swap";
    elseif functions.ccxtruthy(type_var == 2)
        fromAccount = "swap";
        toAccount = "spot";
    end
    timestamp = safeInteger(transfer, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "transfer_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(safeString(data, "currency"), currency = currency),
    Symbol("amount") => self.safeNumber2(data, "amount", "transfer_amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "code"))
)

end
"""
transfer currency internally between wallets on the same account
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#transfer-assets-among-accounts
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#accounttransfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: 'spot', 'swap', 'margin', 'OTC' - account to transfer from
- `toAccount`::string: 'spot', 'swap', 'margin', 'OTC' - account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Digifinex, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    currencyId = get(currency, Symbol("id"), nothing);
    accountsByType = safeValue(self.options, "accountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    request = Dict{Symbol, Any}();
    fromSwap = (fromAccount == "swap");
    toSwap = (toAccount == "swap");
    response = nothing;
    amountString = self.currencyToPrecision(code, amount);
    if functions.ccxtruthy(@functions.ccxt_or(fromSwap, toSwap))
        if functions.ccxtruthy(@functions.ccxt_and((fromId != "1"), (toId != "1")))
            throw(ExchangeError(string(self.id, " transfer() supports transferring between spot and swap, spot and margin, spot and OTC only")));
        end
        request[Symbol("type")] = functions.ccxtruthy(toSwap) ? 1 : 2;
        request[Symbol("currency")] = currencyId;
        request[Symbol("transfer_amount")] = amountString;
        response = Base.fetch(self.privateSwapPostAccountTransfer(extend(request, params)));
    else
        request[Symbol("currency_mark")] = currencyId;
        request[Symbol("num")] = amountString;
        request[Symbol("from")] = fromId;
        request[Symbol("to")] = toId;
        response = Base.fetch(self.privateSpotPostTransfer(extend(request, params)));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " transfer() returned empty response")));
    end
    return self.parseTransfer(response, currency = currency)

end
"""
make a withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Digifinex, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("address") => address,
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    response = Base.fetch(self.privateSpotPostWithdrawNew(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function fetchBorrowInterest(self::Digifinex; code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateSpotGetMarginPositions(extend(request, params)));
    rows = safeValue(response, "positions");
    interest = self.parseBorrowInterests(rows, market = market);
    return self.filterByCurrencySinceLimit(interest, code = code, since = since, limit = limit)

end
function parseBorrowInterest(self::Digifinex, info; market=nothing)
    marketId = safeString(info, "symbol");
    amountString = safeString(info, "amount");
    leverageString = safeString(info, "leverage_ratio");
    amountInvested = stringDiv(amountString, leverageString);
    amountBorrowed = stringSub(amountString, amountInvested);
    currency = functions.ccxtruthy((market == nothing)) ? nothing : get(market, Symbol("base"), nothing);
    symbol = self.safeSymbol(marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("currency") => currency,
    Symbol("interest") => nothing,
    Symbol("interestRate") => 0.001,
    Symbol("amountBorrowed") => self.parseNumber(amountBorrowed),
    Symbol("marginMode") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure}
"""
function fetchCrossBorrowRate(self::Digifinex, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateSpotGetMarginAssets(extend(request, params)));
    data = safeValue(response, "list", []);
    result = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        if functions.ccxtruthy(safeString(entry, "currency") == code)
            result = entry;
        end
        i += 1
    end
    currency = self.currency(code);
    return self.parseBorrowRate(result, currency = currency)

end
"""
fetch the borrow interest rates of all currencies
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchCrossBorrowRates(self::Digifinex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateSpotGetMarginAssets(params));
    result = safeValue(response, "list", []);
    return self.parseBorrowRates(result, "currency")

end
function parseBorrowRate(self::Digifinex, info; currency=nothing)
    timestamp = milliseconds();
    currencyId = safeString(info, "currency");
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("rate") => 0.001,
    Symbol("period") => 86400000,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
function parseBorrowRates(self::Digifinex, info, codeKey)
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        item = get(info, i + 1, nothing);
        currency = safeString(item, codeKey);
        code = self.safeCurrencyCode(currency);
        borrowRate = self.parseBorrowRate(item);
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = borrowRate;
        end
        i += 1
    end
    return result

end
"""
fetch the current funding rate
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#currentfundingrate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Digifinex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_id") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicSwapGetPublicFundingRate(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseFundingRate(data, market = market)

end
"""
fetch the current funding rate interval
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#currentfundingrate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingInterval(self::Digifinex, symbol; params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params = params))

end
function parseFundingRate(self::Digifinex, contract; market=nothing)
    marketId = safeString(contract, "instrument_id");
    timestamp = safeInteger(contract, "funding_time");
    nextTimestamp = safeInteger(contract, "next_funding_time");
    fundingTimeString = safeString(contract, "funding_time");
    nextFundingTimeString = safeString(contract, "next_funding_time");
    millisecondsInterval = stringSub(nextFundingTimeString, fundingTimeString);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "funding_rate"),
    Symbol("fundingTimestamp") => timestamp,
    Symbol("fundingDatetime") => self.iso8601(timestamp),
    Symbol("nextFundingRate") => self.safeNumber(contract, "next_funding_rate"),
    Symbol("nextFundingTimestamp") => nextTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => self.parseFundingInterval(millisecondsInterval)
)

end
function parseFundingInterval(self::Digifinex, interval)
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
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#fundingratehistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Digifinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRateHistory() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_id") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_timestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicSwapGetPublicFundingRateHistory(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    result = safeValue(data, "funding_rates", []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        entry = get(result, i + 1, nothing);
        marketId = safeString(data, "instrument_id");
        symbolInner = self.safeSymbol(marketId);
        timestamp = safeInteger(entry, "time");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbolInner,
    Symbol("fundingRate") => self.safeNumber(entry, "rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
"""
fetch the trading fees for a market
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#tradingfee

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Digifinex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadRequest(string(self.id, " fetchTradingFee() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_id") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateSwapGetAccountTradingFeeRate(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return self.parseTradingFee(data, market = market)

end
function parseTradingFee(self::Digifinex, fee; market=nothing)
    marketId = safeString(fee, "instrument_id");
    symbol = self.safeSymbol(marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "maker_fee_rate"),
    Symbol("taker") => self.safeNumber(fee, "taker_fee_rate"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
"""
fetch all open positions
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-positions
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Digifinex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    market = nothing;
    marketType = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = nothing;
        if functions.ccxtruthy(functions.ccxt_isArray(symbols))
            symbolsLength = length(symbols);
            if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 1))
                throw(BadRequest(string(self.id, " fetchPositions() symbols argument cannot contain more than 1 symbol")));
            end
            symbol = get(symbols, 1, nothing);
        else
            symbol = symbols;
        end
        market = self.market(symbol);
    end
    (marketType, params) = self.handleMarketTypeAndParams("fetchPositions", market = market, params = params);
    (marginMode, query) = self.handleMarginModeAndParams("fetchPositions", params = params);
    if functions.ccxtruthy(marginMode != nothing)
        marketType = "margin";
    end
    if functions.ccxtruthy(market != nothing)
        marketIdRequest = functions.ccxtruthy((marketType == "swap")) ? "instrument_id" : "symbol";
        request[Symbol(marketIdRequest)] = get(market, Symbol("id"), nothing);
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(marketType == "spot", marketType == "margin"))
        response = Base.fetch(self.privateSpotGetMarginPositions(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privateSwapGetAccountPositions(extend(request, query)));
    else
        throw(NotSupported(string(self.id, " fetchPositions() not support this market type")));
    end
    positionRequest = functions.ccxtruthy((marketType == "swap")) ? "data" : "positions";
    positions = safeValue(response, positionRequest, []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        push!(result, self.parsePosition(get(positions, i + 1, nothing), market = market));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
"""
fetch data on a single open contract trade position
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-positions
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Digifinex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchPosition", market = market, params = params);
    (marginMode, query) = self.handleMarginModeAndParams("fetchPosition", params = params);
    if functions.ccxtruthy(marginMode != nothing)
        marketType = "margin";
    end
    marketIdRequest = functions.ccxtruthy((marketType == "swap")) ? "instrument_id" : "symbol";
    request[Symbol(marketIdRequest)] = get(market, Symbol("id"), nothing);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(marketType == "spot", marketType == "margin"))
        response = Base.fetch(self.privateSpotGetMarginPositions(extend(request, query)));
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privateSwapGetAccountPositions(extend(request, query)));
    else
        throw(NotSupported(string(self.id, " fetchPosition() not support this market type")));
    end
    dataRequest = functions.ccxtruthy((marketType == "swap")) ? "data" : "positions";
    data = safeValue(response, dataRequest, []);
    position = self.parsePosition(get(data, 1, nothing), market = market);
    if functions.ccxtruthy(marketType == "swap")
            return position
    else
        position[Symbol("collateral")] = self.safeNumber(response, "margin");
        position[Symbol("marginRatio")] = self.safeNumber(response, "margin_rate");
        return position
    end

end
function parsePosition(self::Digifinex, position; market=nothing)
    marketId = safeString2(position, "instrument_id", "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    marginMode = safeString(position, "margin_mode");
    if functions.ccxtruthy(marginMode != nothing)
        marginMode = functions.ccxtruthy((marginMode == "crossed")) ? "cross" : "isolated";
    else
        marginMode = "crossed";
    end
    timestamp = safeInteger(position, "timestamp");
    side = safeString(position, "side");
    if functions.ccxtruthy(side == "go_long")
        side = "long";
    elseif functions.ccxtruthy(side == "go_short")
        side = "short";
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("notional") => self.safeNumber(position, "amount"),
    Symbol("marginMode") => marginMode,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidation_price"),
    Symbol("entryPrice") => self.safeNumber2(position, "avg_cost", "entry_price"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealized_pnl"),
    Symbol("contracts") => self.safeNumber(position, "avail_position"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("markPrice") => self.safeNumber(position, "last"),
    Symbol("side") => side,
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("maintenanceMargin") => self.safeNumber(position, "margin"),
    Symbol("maintenanceMarginPercentage") => self.safeNumber(position, "maint_margin_ratio"),
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => self.safeNumber2(position, "leverage", "leverage_ratio"),
    Symbol("marginRatio") => self.safeNumber(position, "margin_ratio"),
    Symbol("percentage") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
set the level of leverage for a market
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#setleverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: either 'cross' or 'isolated', default is cross
- `params.side`::string, optional: either 'long' or 'short', required for isolated markets only

# Returns
- response from the exchange
"""
function setLeverage(self::Digifinex, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("type"), nothing) != "swap")
        throw(BadSymbol(string(self.id, " setLeverage() supports swap contracts only")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 100))))
        throw(BadRequest(string(self.id, " leverage should be between 1 and 100")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_id") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage
    );
    defaultMarginMode = safeString2(self.options, "marginMode", "defaultMarginMode");
    marginMode = safeStringLower2(params, "marginMode", "defaultMarginMode", defaultMarginMode);
    if functions.ccxtruthy(marginMode != nothing)
        marginMode = functions.ccxtruthy((marginMode == "cross")) ? "crossed" : "isolated";
        request[Symbol("margin_mode")] = marginMode;
        params = omit(params, ["marginMode", "defaultMarginMode"]);
    end
    if functions.ccxtruthy(marginMode == "isolated")
        side = safeString(params, "side");
        if functions.ccxtruthy(side != nothing)
            request[Symbol("side")] = side;
            params = omit(params, "side");
        else
            self.checkRequiredArgument("setLeverage", side, "side", options = ["long", "short"]);
        end
    end
    return Base.fetch(self.privateSwapPostAccountLeverage(extend(request, params)))

end
"""
fetch the transfer history, only transfers between spot and swap accounts are supported
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#transferrecord

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Digifinex; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        if functions.ccxtruthy(currency == nothing)
            throw(ExchangeError(string(self.id, " fetchTransfers() could not resolve currency")));
        end
        request[Symbol("currency")] = safeString(currency, "id");
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_timestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateSwapGetAccountTransferRecord(extend(request, params)));
    transfers = self.safeList(response, "data", defaultValue = []);
    return self.parseTransfers(transfers, currency = currency, since = since, limit = limit)

end
"""
retrieve information on the maximum leverage, for different trade sizes
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#instruments

# Arguments
- `symbols`::any: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
function fetchLeverageTiers(self::Digifinex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicSwapGetPublicInstruments(params));
    data = safeValue(response, "data", []);
    symbols = self.marketSymbols(symbols = symbols);
    return self.parseLeverageTiers(data, symbols = symbols, marketIdKey = "instrument_id")

end
"""
retrieve information on the maximum leverage, for different trade sizes for a single market
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#instrument

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
function fetchMarketLeverageTiers(self::Digifinex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadRequest(string(self.id, " fetchMarketLeverageTiers() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_id") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicSwapGetPublicInstrument(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return self.parseMarketLeverageTiers(data, market = market)

end
function parseMarketLeverageTiers(self::Digifinex, info; market=nothing)
    tiers = [];
    brackets = safeValue(info, "open_max_limits", Dict{Symbol, Any}());
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(brackets)))
        tier = get(brackets, i + 1, nothing);
        marketId = safeString(info, "instrument_id");
        market = self.safeMarket(marketId = marketId, market = market);
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.sum(i, 1),
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
    Symbol("currency") => get(market, Symbol("settle"), nothing),
    Symbol("minNotional") => nothing,
    Symbol("maxNotional") => self.safeNumber(tier, "max_limit"),
    Symbol("maintenanceMarginRate") => nothing,
    Symbol("maxLeverage") => self.safeNumber(tier, "leverage"),
    Symbol("info") => tier
));
        i += 1
    end
    return tiers

end
function handleMarginModeAndParams(self::Digifinex, methodName; params=Dict(), defaultValue=nothing)
    defaultType = safeString(self.options, "defaultType");
    isMargin = self.safeBool(params, "margin", defaultValue = false);
    marginMode = nothing;
    (marginMode, params) = handleMarginModeAndParams(self.parent, methodName, params = params, defaultValue = defaultValue);
    if functions.ccxtruthy(marginMode != nothing)
        if functions.ccxtruthy(marginMode != "cross")
            throw(NotSupported(string(self.id, " only cross margin is supported")));
        end
    else
        if functions.ccxtruthy(@functions.ccxt_or((defaultType == "margin"), (isMargin)))
            marginMode = "cross";
        end
    end
    return [marginMode, params]

end
"""
fetch deposit and withdraw fees
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-currency-deposit-and-withdrawal-information

# Arguments
- `codes`::any: not used by fetchDepositWithdrawFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Digifinex; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicSpotGetCurrencies(params));
    data = self.safeList(response, "data");
    return self.parseDepositWithdrawFees(data, codes = codes)

end
function parseDepositWithdrawFees(self::Digifinex, response; codes=nothing, currencyIdKey=nothing)
    depositWithdrawFees = Dict{Symbol, Any}();
    codes = self.marketCodes(codes = codes);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        currencyId = safeString(entry, "currency");
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (@functions.ccxt_or((codes == nothing), (inArray(code, codes))))))
            depositWithdrawFee = safeValue(depositWithdrawFees, code);
            if functions.ccxtruthy(depositWithdrawFee == nothing)
                depositWithdrawFees[Symbol(code)] = self.depositWithdrawFee(Dict{Symbol, Any}());
                depositWithdrawFees[Symbol(code)][Symbol("info")] = [];
            end
            depositWithdrawInfo = get(get(depositWithdrawFees, Symbol(code), nothing), Symbol("info"), nothing);
                        push!(depositWithdrawInfo, entry);
            networkId = safeString(entry, "chain");
            withdrawFee = safeValue(entry, "min_withdraw_fee");
            withdrawResult = Dict{Symbol, Any}(
                Symbol("fee") => withdrawFee,
                Symbol("percentage") => functions.ccxtruthy((withdrawFee != nothing)) ? false : nothing
            );
            depositResult = Dict{Symbol, Any}(
                Symbol("fee") => nothing,
                Symbol("percentage") => nothing
            );
            if functions.ccxtruthy(networkId != nothing)
                networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
                if functions.ccxtruthy(networkCode != nothing)
                    depositWithdrawFees[Symbol(code)][Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                        Symbol("withdraw") => withdrawResult,
                        Symbol("deposit") => depositResult
                    );
                end
            else
                depositWithdrawFees[Symbol(code)][Symbol("withdraw")] = withdrawResult;
                depositWithdrawFees[Symbol(code)][Symbol("deposit")] = depositResult;
            end
        end
        i += 1
    end
    depositWithdrawCodes = objectKeys(depositWithdrawFees);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(depositWithdrawCodes)))
        code = get(depositWithdrawCodes, i + 1, nothing);
        currency = self.currency(code);
        depositWithdrawFees[Symbol(code)] = self.assignDefaultDepositWithdrawFees(get(depositWithdrawFees, Symbol(code), nothing), currency = currency);
        i += 1
    end
    return depositWithdrawFees

end
"""
add margin to a position
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmargin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string: the position side: 'long' or 'short'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Digifinex, symbol, amount; params=Dict())
    side = safeString(params, "side");
    self.checkRequiredArgument("addMargin", side, "side", options = ["long", "short"]);
    return Base.fetch(self.modifyMarginHelper(symbol, amount, 1, params = params))

end
"""
remove margin from a position
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmargin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string: the position side: 'long' or 'short'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Digifinex, symbol, amount; params=Dict())
    side = safeString(params, "side");
    self.checkRequiredArgument("reduceMargin", side, "side", options = ["long", "short"]);
    return Base.fetch(self.modifyMarginHelper(symbol, amount, 2, params = params))

end
function modifyMarginHelper(self::Digifinex, symbol, amount, type_var; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    side = safeString(params, "side");
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_id") => get(market, Symbol("id"), nothing),
        Symbol("amount") => numberToString(amount),
        Symbol("type") => type_var,
        Symbol("side") => side
    );
    response = Base.fetch(self.privateSwapPostAccountPositionMargin(extend(request, params)));
    code = safeInteger(response, "code");
    status = functions.ccxtruthy((code == 0)) ? "ok" : "failed";
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return extend(self.parseMarginModification(data, market = market), Dict{Symbol, Any}(
    Symbol("status") => status
))

end
function parseMarginModification(self::Digifinex, data; market=nothing)
    marketId = safeString(data, "instrument_id");
    rawType = safeInteger(data, "type");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
    Symbol("type") => functions.ccxtruthy((rawType == 1)) ? "add" : "reduce",
    Symbol("marginMode") => "isolated",
    Symbol("amount") => self.safeNumber(data, "amount"),
    Symbol("total") => nothing,
    Symbol("code") => safeString(market, "settle"),
    Symbol("status") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
fetch the history of funding payments paid and received on this account
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#funding-fee

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding payment

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Digifinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("end_timestamp", request, params);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_id")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_timestamp")] = since;
    end
    response = Base.fetch(self.privateSwapGetAccountFundingFee(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseIncomes(data, market = market, since = since, limit = limit)

end
function parseIncome(self::Digifinex, income; market=nothing)
    marketId = safeString(income, "instrument_id");
    currencyId = safeString(income, "currency");
    timestamp = safeInteger(income, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => nothing,
    Symbol("amount") => self.safeNumber(income, "amount")
)

end
"""
set margin mode to 'cross' or 'isolated'
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmode

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Digifinex, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = lowercase(marginMode);
    if functions.ccxtruthy(marginMode == "cross")
        marginMode = "crossed";
    end
    request = Dict{Symbol, Any}(
        Symbol("instrument_id") => get(market, Symbol("id"), nothing),
        Symbol("margin_mode") => marginMode
    );
    return Base.fetch(self.privateSwapPostAccountPositionMode(extend(request, params)))

end
function sign(self::Digifinex, path; api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    signed = get(api, 1, nothing) == "private";
    endpoint = get(api, 2, nothing);
    pathPart = functions.ccxtruthy((endpoint == "spot")) ? "/v3" : "/swap/v2";
    request = string("/", self.implodeParams(path, params));
    payload = string(pathPart, request);
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), payload);
    query = omit(params, self.extractParams(path));
    urlencoded = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(signed, (pathPart == "/swap/v2")), (method == "POST")))
        urlencoded = functions.json(params);
    else
        urlencoded = self.urlencode(keysort(query));
    end
    if functions.ccxtruthy(signed)
        auth = nothing;
        nonce = nothing;
        if functions.ccxtruthy(pathPart == "/swap/v2")
            nonce = string(milliseconds());
            auth = string(nonce, method, payload);
            if functions.ccxtruthy(method == "GET")
                if functions.ccxtruthy(urlencoded)
                    auth += string("?", urlencoded);
                end
            elseif functions.ccxtruthy(method == "POST")
                auth += urlencoded;
            end
        else
            nonce = string(self.nonce());
            auth = urlencoded;
        end
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(urlencoded)
                url += string("?", urlencoded);
            end
        elseif functions.ccxtruthy(method == "POST")
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "application/x-www-form-urlencoded"
            );
            if functions.ccxtruthy(urlencoded)
                body = urlencoded;
            end
        end
        headers = Dict{Symbol, Any}(
            Symbol("ACCESS-KEY") => self.apiKey,
            Symbol("ACCESS-SIGN") => signature,
            Symbol("ACCESS-TIMESTAMP") => nonce
        );
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
function handleErrors(self::Digifinex, statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    code = safeString(response, "code");
    if functions.ccxtruthy(@functions.ccxt_or((code == "0"), (code == "200")))
            return nothing
    end
    feedback = string(self.id, " ", responseBody);
    if functions.ccxtruthy(code == nothing)
        throw(BadResponse(feedback));
    end
    unknownError = [ExchangeError, feedback];
    (ExceptionClass, message) = safeValue(get(self.exceptions, Symbol("exact"), nothing), code, unknownError);
    throw(ExceptionClass(message));

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Digifinex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicSpotGetMarketSymbols(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/symbols"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetKline(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "kline"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetMarginCurrencies(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/currencies"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetMarginSymbols(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/symbols"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetMarkets(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "markets"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetOrderBook(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "order_book"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetPing(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "ping"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotSymbols(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/symbols"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTime(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "time"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTrades(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trades"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTradesSymbols(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trades/symbols"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTicker(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "ticker"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetCurrencies(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "currencies"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicApiWeight(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/api_weight"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicCandles(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/candles"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicCandlesHistory(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/candles_history"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicDepth(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/depth"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicFundingRate(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/funding_rate"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicFundingRateHistory(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/funding_rate_history"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicInstrument(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/instrument"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicInstruments(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/instruments"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicTicker(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/ticker"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicTickers(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/tickers"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicTime(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/time"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetPublicTrades(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "public/trades"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarketFinancelog(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/financelog"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarketMytrades(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/mytrades"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarketOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarketOrderDetail(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/order/detail"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarketOrderCurrent(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/order/current"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarketOrderHistory(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/order/history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarginAssets(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/assets"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarginFinancelog(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/financelog"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarginMytrades(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/mytrades"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarginOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarginOrderCurrent(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/order/current"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarginOrderHistory(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/order/history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetMarginPositions(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/positions"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetOtcFinancelog(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "otc/financelog"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotAssets(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/assets"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotFinancelog(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/financelog"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotMytrades(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/mytrades"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotOrderCurrent(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/order/current"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotOrderHistory(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/order/history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetDepositAddress(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "deposit/address"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetDepositHistory(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "deposit/history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetWithdrawHistory(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "withdraw/history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostMarketOrderCancel(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/order/cancel"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostMarketOrderNew(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/order/new"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostMarketOrderBatchNew(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "{market}/order/batch_new"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostMarginOrderCancel(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/order/cancel"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostMarginOrderNew(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/order/new"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostMarginPositionClose(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "margin/position/close"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotOrderCancel(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/order/cancel"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotOrderNew(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "spot/order/new"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostTransfer(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "transfer"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostWithdrawNew(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "withdraw/new"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostWithdrawCancel(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "withdraw/cancel"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetAccountBalance(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/balance"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetAccountPositions(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/positions"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetAccountFinanceRecord(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/finance_record"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetAccountTradingFeeRate(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/trading_fee_rate"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetAccountTransferRecord(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/transfer_record"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetAccountFundingFee(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/funding_fee"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetTradeHistoryOrders(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trade/history_orders"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetTradeHistoryTrades(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trade/history_trades"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetTradeOpenOrders(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trade/open_orders"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetTradeOrderInfo(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trade/order_info"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostAccountTransfer(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/transfer"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostAccountLeverage(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/leverage"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostAccountPositionMode(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/position_mode"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostAccountPositionMargin(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "account/position_margin"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostTradeBatchCancelOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trade/batch_cancel_order"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostTradeBatchOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trade/batch_order"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostTradeCancelOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trade/cancel_order"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostTradeOrderPlace(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "trade/order_place"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowSponsorOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/sponsor_order"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowCloseOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/close_order"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowCancelOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/cancel_order"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowUserCenterCurrent(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/user_center_current"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowUserCenterHistory(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/user_center_history"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowExpertCurrentOpenOrder(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/expert_current_open_order"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowAddAlgo(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/add_algo"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowCancelAlgo(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/cancel_algo"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowAccountAvailable(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/account_available"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowPlanTask(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/plan_task"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostFollowInstrumentList(self::Digifinex, params=Dict(), context=Dict())
    return request(self, "follow/instrument_list"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Digifinex(; kwargs...)
    inst = Digifinex(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, fetchMarketsV2, fetchMarketsV1, parseBalance, fetchBalance, fetchOrderBook, fetchTickers, fetchTicker, parseTicker, parseTrade, fetchTime, fetchStatus, fetchTrades, parseOHLCV, fetchOHLCV, createOrder, createOrders, createOrderRequest, createMarketBuyOrderWithCost, cancelOrder, parseCancelOrders, cancelOrders, parseOrderStatus, parseOrder, fetchOpenOrders, fetchOrders, fetchOrder, fetchMyTrades, parseLedgerEntryType, parseLedgerEntry, fetchLedger, parseDepositAddress, fetchDepositAddress, fetchTransactionsByType, fetchDeposits, fetchWithdrawals, parseTransactionStatus, parseTransaction, parseTransferStatus, parseTransfer, transfer, withdraw, fetchBorrowInterest, parseBorrowInterest, fetchCrossBorrowRate, fetchCrossBorrowRates, parseBorrowRate, parseBorrowRates, fetchFundingRate, fetchFundingInterval, parseFundingRate, parseFundingInterval, fetchFundingRateHistory, fetchTradingFee, parseTradingFee, fetchPositions, fetchPosition, parsePosition, setLeverage, fetchTransfers, fetchLeverageTiers, fetchMarketLeverageTiers, parseMarketLeverageTiers, handleMarginModeAndParams, fetchDepositWithdrawFees, parseDepositWithdrawFees, addMargin, reduceMargin, modifyMarginHelper, parseMarginModification, fetchFundingHistory, parseIncome, setMarginMode, sign, handleErrors, publicSpotGetMarketSymbols, publicSpotGetKline, publicSpotGetMarginCurrencies, publicSpotGetMarginSymbols, publicSpotGetMarkets, publicSpotGetOrderBook, publicSpotGetPing, publicSpotGetSpotSymbols, publicSpotGetTime, publicSpotGetTrades, publicSpotGetTradesSymbols, publicSpotGetTicker, publicSpotGetCurrencies, publicSwapGetPublicApiWeight, publicSwapGetPublicCandles, publicSwapGetPublicCandlesHistory, publicSwapGetPublicDepth, publicSwapGetPublicFundingRate, publicSwapGetPublicFundingRateHistory, publicSwapGetPublicInstrument, publicSwapGetPublicInstruments, publicSwapGetPublicTicker, publicSwapGetPublicTickers, publicSwapGetPublicTime, publicSwapGetPublicTrades, privateSpotGetMarketFinancelog, privateSpotGetMarketMytrades, privateSpotGetMarketOrder, privateSpotGetMarketOrderDetail, privateSpotGetMarketOrderCurrent, privateSpotGetMarketOrderHistory, privateSpotGetMarginAssets, privateSpotGetMarginFinancelog, privateSpotGetMarginMytrades, privateSpotGetMarginOrder, privateSpotGetMarginOrderCurrent, privateSpotGetMarginOrderHistory, privateSpotGetMarginPositions, privateSpotGetOtcFinancelog, privateSpotGetSpotAssets, privateSpotGetSpotFinancelog, privateSpotGetSpotMytrades, privateSpotGetSpotOrder, privateSpotGetSpotOrderCurrent, privateSpotGetSpotOrderHistory, privateSpotGetDepositAddress, privateSpotGetDepositHistory, privateSpotGetWithdrawHistory, privateSpotPostMarketOrderCancel, privateSpotPostMarketOrderNew, privateSpotPostMarketOrderBatchNew, privateSpotPostMarginOrderCancel, privateSpotPostMarginOrderNew, privateSpotPostMarginPositionClose, privateSpotPostSpotOrderCancel, privateSpotPostSpotOrderNew, privateSpotPostTransfer, privateSpotPostWithdrawNew, privateSpotPostWithdrawCancel, privateSwapGetAccountBalance, privateSwapGetAccountPositions, privateSwapGetAccountFinanceRecord, privateSwapGetAccountTradingFeeRate, privateSwapGetAccountTransferRecord, privateSwapGetAccountFundingFee, privateSwapGetTradeHistoryOrders, privateSwapGetTradeHistoryTrades, privateSwapGetTradeOpenOrders, privateSwapGetTradeOrderInfo, privateSwapPostAccountTransfer, privateSwapPostAccountLeverage, privateSwapPostAccountPositionMode, privateSwapPostAccountPositionMargin, privateSwapPostTradeBatchCancelOrder, privateSwapPostTradeBatchOrder, privateSwapPostTradeCancelOrder, privateSwapPostTradeOrderPlace, privateSwapPostFollowSponsorOrder, privateSwapPostFollowCloseOrder, privateSwapPostFollowCancelOrder, privateSwapPostFollowUserCenterCurrent, privateSwapPostFollowUserCenterHistory, privateSwapPostFollowExpertCurrentOpenOrder, privateSwapPostFollowAddAlgo, privateSwapPostFollowCancelAlgo, privateSwapPostFollowAccountAvailable, privateSwapPostFollowPlanTask, privateSwapPostFollowInstrumentList)
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
function __ccxt_doc_Digifinex_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-currency-deposit-and-withdrawal-information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Digifinex_fetchCurrencies

function __ccxt_doc_Digifinex_fetchMarkets() end
"""
retrieves data on all markets for digifinex
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#all-the-market-description
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#spot-trading-pair-symbol
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-trading-pair-symbol
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Digifinex_fetchMarkets

function __ccxt_doc_Digifinex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#spot-account-assets
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#accountbalance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Digifinex_fetchBalance

function __ccxt_doc_Digifinex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-orderbook
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Digifinex_fetchOrderBook

function __ccxt_doc_Digifinex_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#ticker-price
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Digifinex_fetchTickers

function __ccxt_doc_Digifinex_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#ticker-price
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Digifinex_fetchTicker

function __ccxt_doc_Digifinex_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#server-timestamp

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Digifinex_fetchTime

function __ccxt_doc_Digifinex_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#server-ping

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Digifinex_fetchStatus

function __ccxt_doc_Digifinex_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-recent-trades
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#recenttrades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Digifinex_fetchTrades

function __ccxt_doc_Digifinex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-candles-data
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#recentcandle

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Digifinex_fetchOHLCV

function __ccxt_doc_Digifinex_createOrder() end
"""
create a trade order
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-new-order
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderplace

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency, spot market orders use the quote currency, swap requires the number of contracts
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: "GTC", "IOC", "FOK", or "PO"
- `params.postOnly`::bool, optional: true or false
- `params.reduceOnly`::bool, optional: true or false
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Digifinex_createOrder

function __ccxt_doc_Digifinex_createOrders() end
"""
create a list of trade orders (all orders should be of the same symbol)
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-multiple-order
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#batchorder

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Digifinex_createOrders

function __ccxt_doc_Digifinex_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-new-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Digifinex_createMarketBuyOrderWithCost

function __ccxt_doc_Digifinex_cancelOrder() end
"""
cancels an open order
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#cancel-order
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#cancelorder

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Digifinex_cancelOrder

function __ccxt_doc_Digifinex_cancelOrders() end
"""
cancel multiple orders
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#cancel-order

# Arguments
- `ids`::array: order ids
- `symbol`::string: not used by cancelOrders ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Digifinex_cancelOrders

function __ccxt_doc_Digifinex_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#current-active-orders
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#openorder

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Digifinex_fetchOpenOrders

function __ccxt_doc_Digifinex_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-all-orders-including-history-orders
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#historyorder

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Digifinex_fetchOrders

function __ccxt_doc_Digifinex_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-order-status
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderinfo

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Digifinex_fetchOrder

function __ccxt_doc_Digifinex_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#customer-39-s-trades
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#historytrade

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Digifinex_fetchMyTrades

function __ccxt_doc_Digifinex_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#spot-margin-otc-financial-logs
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#bills

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Digifinex_fetchLedger

function __ccxt_doc_Digifinex_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#deposit-address-inquiry

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Digifinex_fetchDepositAddress

function __ccxt_doc_Digifinex_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#deposit-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Digifinex_fetchDeposits

function __ccxt_doc_Digifinex_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#withdrawal-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Digifinex_fetchWithdrawals

function __ccxt_doc_Digifinex_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#transfer-assets-among-accounts
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#accounttransfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: 'spot', 'swap', 'margin', 'OTC' - account to transfer from
- `toAccount`::string: 'spot', 'swap', 'margin', 'OTC' - account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Digifinex_transfer

function __ccxt_doc_Digifinex_withdraw() end
"""
make a withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Digifinex_withdraw

function __ccxt_doc_Digifinex_fetchCrossBorrowRate() end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure}
"""
__ccxt_doc_Digifinex_fetchCrossBorrowRate

function __ccxt_doc_Digifinex_fetchCrossBorrowRates() end
"""
fetch the borrow interest rates of all currencies
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Digifinex_fetchCrossBorrowRates

function __ccxt_doc_Digifinex_fetchFundingRate() end
"""
fetch the current funding rate
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#currentfundingrate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Digifinex_fetchFundingRate

function __ccxt_doc_Digifinex_fetchFundingInterval() end
"""
fetch the current funding rate interval
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#currentfundingrate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Digifinex_fetchFundingInterval

function __ccxt_doc_Digifinex_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#fundingratehistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Digifinex_fetchFundingRateHistory

function __ccxt_doc_Digifinex_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#tradingfee

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Digifinex_fetchTradingFee

function __ccxt_doc_Digifinex_fetchPositions() end
"""
fetch all open positions
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-positions
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Digifinex_fetchPositions

function __ccxt_doc_Digifinex_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-positions
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Digifinex_fetchPosition

function __ccxt_doc_Digifinex_setLeverage() end
"""
set the level of leverage for a market
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#setleverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: either 'cross' or 'isolated', default is cross
- `params.side`::string, optional: either 'long' or 'short', required for isolated markets only

# Returns
- response from the exchange
"""
__ccxt_doc_Digifinex_setLeverage

function __ccxt_doc_Digifinex_fetchTransfers() end
"""
fetch the transfer history, only transfers between spot and swap accounts are supported
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#transferrecord

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of  transfers to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Digifinex_fetchTransfers

function __ccxt_doc_Digifinex_fetchLeverageTiers() end
"""
retrieve information on the maximum leverage, for different trade sizes
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#instruments

# Arguments
- `symbols`::any: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
__ccxt_doc_Digifinex_fetchLeverageTiers

function __ccxt_doc_Digifinex_fetchMarketLeverageTiers() end
"""
retrieve information on the maximum leverage, for different trade sizes for a single market
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#instrument

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
__ccxt_doc_Digifinex_fetchMarketLeverageTiers

function __ccxt_doc_Digifinex_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-currency-deposit-and-withdrawal-information

# Arguments
- `codes`::any: not used by fetchDepositWithdrawFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Digifinex_fetchDepositWithdrawFees

function __ccxt_doc_Digifinex_addMargin() end
"""
add margin to a position
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmargin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string: the position side: 'long' or 'short'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Digifinex_addMargin

function __ccxt_doc_Digifinex_reduceMargin() end
"""
remove margin from a position
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmargin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string: the position side: 'long' or 'short'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Digifinex_reduceMargin

function __ccxt_doc_Digifinex_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#funding-fee

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding payment

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Digifinex_fetchFundingHistory

function __ccxt_doc_Digifinex_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmode

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Digifinex_setMarginMode
