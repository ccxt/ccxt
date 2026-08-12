@kwdef mutable struct Blofin <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchMarkPrice::Function = fetchMarkPrice
    fetchTickers::Function = fetchTickers
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRate::Function = parseFundingRate
    fetchFundingRate::Function = fetchFundingRate
    parseBalanceByType::Function = parseBalanceByType
    parseBalance::Function = parseBalance
    parseFundingBalance::Function = parseFundingBalance
    parseTradingFee::Function = parseTradingFee
    fetchBalance::Function = fetchBalance
    createOrderRequest::Function = createOrderRequest
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    createTpslOrderRequest::Function = createTpslOrderRequest
    cancelOrder::Function = cancelOrder
    createOrders::Function = createOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchMyTrades::Function = fetchMyTrades
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchLedger::Function = fetchLedger
    parseTransaction::Function = parseTransaction
    parseTransactionWithdrawalStatus::Function = parseTransactionWithdrawalStatus
    parseTransactionDepositStatus::Function = parseTransactionDepositStatus
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    parseIds::Function = parseIds
    cancelOrders::Function = cancelOrders
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    fetchPositionsHistory::Function = fetchPositionsHistory
    parsePosition::Function = parsePosition
    fetchLeverages::Function = fetchLeverages
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    setLeverage::Function = setLeverage
    closePosition::Function = closePosition
    fetchClosedOrders::Function = fetchClosedOrders
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    setMarginMode::Function = setMarginMode
    fetchPositionMode::Function = fetchPositionMode
    setPositionMode::Function = setPositionMode
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank
    handleErrors::Function = handleErrors
    sign::Function = sign

# Generated REST endpoint fields
    publicGetMarketInstruments::Function = publicGetMarketInstruments
    publicGetMarketTickers::Function = publicGetMarketTickers
    publicGetMarketBooks::Function = publicGetMarketBooks
    publicGetMarketTrades::Function = publicGetMarketTrades
    publicGetMarketMarkPrice::Function = publicGetMarketMarkPrice
    publicGetMarketFundingRate::Function = publicGetMarketFundingRate
    publicGetMarketFundingRateHistory::Function = publicGetMarketFundingRateHistory
    publicGetMarketCandles::Function = publicGetMarketCandles
    publicGetMarketIndexCandles::Function = publicGetMarketIndexCandles
    publicGetMarketMarkPriceCandles::Function = publicGetMarketMarkPriceCandles
    publicGetMarketPositionTiers::Function = publicGetMarketPositionTiers
    privateGetAssetBalances::Function = privateGetAssetBalances
    privateGetAssetBills::Function = privateGetAssetBills
    privateGetAssetWithdrawalHistory::Function = privateGetAssetWithdrawalHistory
    privateGetAssetDepositHistory::Function = privateGetAssetDepositHistory
    privateGetAccountConfig::Function = privateGetAccountConfig
    privateGetAssetCurrencies::Function = privateGetAssetCurrencies
    privateGetAccountBalance::Function = privateGetAccountBalance
    privateGetAccountPositions::Function = privateGetAccountPositions
    privateGetAccountPositionsHistory::Function = privateGetAccountPositionsHistory
    privateGetAccountMarginMode::Function = privateGetAccountMarginMode
    privateGetAccountPositionMode::Function = privateGetAccountPositionMode
    privateGetAccountLeverageInfo::Function = privateGetAccountLeverageInfo
    privateGetAccountBatchLeverageInfo::Function = privateGetAccountBatchLeverageInfo
    privateGetTradeOrdersPending::Function = privateGetTradeOrdersPending
    privateGetTradeOrderDetail::Function = privateGetTradeOrderDetail
    privateGetTradeOrdersTpslPending::Function = privateGetTradeOrdersTpslPending
    privateGetTradeOrderTpslDetail::Function = privateGetTradeOrderTpslDetail
    privateGetTradeOrdersAlgoPending::Function = privateGetTradeOrdersAlgoPending
    privateGetTradeOrdersHistory::Function = privateGetTradeOrdersHistory
    privateGetTradeOrdersTpslHistory::Function = privateGetTradeOrdersTpslHistory
    privateGetTradeOrdersAlgoHistory::Function = privateGetTradeOrdersAlgoHistory
    privateGetTradeFillsHistory::Function = privateGetTradeFillsHistory
    privateGetTradeOrderPriceRange::Function = privateGetTradeOrderPriceRange
    privateGetAffiliateBasic::Function = privateGetAffiliateBasic
    privateGetAffiliateReferralCode::Function = privateGetAffiliateReferralCode
    privateGetAffiliateInvitees::Function = privateGetAffiliateInvitees
    privateGetAffiliateSubInvitees::Function = privateGetAffiliateSubInvitees
    privateGetAffiliateSubAffiliates::Function = privateGetAffiliateSubAffiliates
    privateGetAffiliateInviteesDailyInfo::Function = privateGetAffiliateInviteesDailyInfo
    privateGetCopytradingInstruments::Function = privateGetCopytradingInstruments
    privateGetCopytradingConfig::Function = privateGetCopytradingConfig
    privateGetCopytradingAccountBalance::Function = privateGetCopytradingAccountBalance
    privateGetCopytradingAccountPositionsByOrder::Function = privateGetCopytradingAccountPositionsByOrder
    privateGetCopytradingAccountPositionsDetailsByOrder::Function = privateGetCopytradingAccountPositionsDetailsByOrder
    privateGetCopytradingAccountPositionsByContract::Function = privateGetCopytradingAccountPositionsByContract
    privateGetCopytradingAccountPositionMode::Function = privateGetCopytradingAccountPositionMode
    privateGetCopytradingAccountLeverageInfo::Function = privateGetCopytradingAccountLeverageInfo
    privateGetCopytradingTradeOrdersPending::Function = privateGetCopytradingTradeOrdersPending
    privateGetCopytradingTradePendingTpslByContract::Function = privateGetCopytradingTradePendingTpslByContract
    privateGetCopytradingTradePositionHistoryByOrder::Function = privateGetCopytradingTradePositionHistoryByOrder
    privateGetCopytradingTradeOrdersHistory::Function = privateGetCopytradingTradeOrdersHistory
    privateGetCopytradingTradePendingTpslByOrder::Function = privateGetCopytradingTradePendingTpslByOrder
    privateGetUserQueryApikey::Function = privateGetUserQueryApikey
    privateGetSpotTradeFillsHistory::Function = privateGetSpotTradeFillsHistory
    privatePostAssetTransfer::Function = privatePostAssetTransfer
    privatePostAssetDemoApplyMoney::Function = privatePostAssetDemoApplyMoney
    privatePostAccountSetMarginMode::Function = privatePostAccountSetMarginMode
    privatePostAccountSetPositionMode::Function = privatePostAccountSetPositionMode
    privatePostAccountSetLeverage::Function = privatePostAccountSetLeverage
    privatePostTradeOrder::Function = privatePostTradeOrder
    privatePostTradeBatchOrders::Function = privatePostTradeBatchOrders
    privatePostTradeOrderTpsl::Function = privatePostTradeOrderTpsl
    privatePostTradeOrderAlgo::Function = privatePostTradeOrderAlgo
    privatePostTradeCancelOrder::Function = privatePostTradeCancelOrder
    privatePostTradeCancelBatchOrders::Function = privatePostTradeCancelBatchOrders
    privatePostTradeCancelTpsl::Function = privatePostTradeCancelTpsl
    privatePostTradeCancelAlgo::Function = privatePostTradeCancelAlgo
    privatePostTradeClosePosition::Function = privatePostTradeClosePosition
    privatePostCopytradingAccountSetPositionMode::Function = privatePostCopytradingAccountSetPositionMode
    privatePostCopytradingAccountSetLeverage::Function = privatePostCopytradingAccountSetLeverage
    privatePostCopytradingTradePlaceOrder::Function = privatePostCopytradingTradePlaceOrder
    privatePostCopytradingTradeCancelOrder::Function = privatePostCopytradingTradeCancelOrder
    privatePostCopytradingTradePlaceTpslByContract::Function = privatePostCopytradingTradePlaceTpslByContract
    privatePostCopytradingTradeCancelTpslByContract::Function = privatePostCopytradingTradeCancelTpslByContract
    privatePostCopytradingTradePlaceTpslByOrder::Function = privatePostCopytradingTradePlaceTpslByOrder
    privatePostCopytradingTradeCancelTpslByOrder::Function = privatePostCopytradingTradeCancelTpslByOrder
    privatePostCopytradingTradeClosePositionByOrder::Function = privatePostCopytradingTradeClosePositionByOrder
    privatePostCopytradingTradeClosePositionByContract::Function = privatePostCopytradingTradeClosePositionByContract

end
function describe(self::Blofin, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "blofin",
    Symbol("name") => "BloFin",
    Symbol("countries") => ["US"],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 100,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => true,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => false,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => nothing,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => nothing,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarginModes") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => nothing,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => nothing,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1H",
        Symbol("2h") => "2H",
        Symbol("4h") => "4H",
        Symbol("6h") => "6H",
        Symbol("8h") => "8H",
        Symbol("12h") => "12H",
        Symbol("1d") => "1D",
        Symbol("3d") => "3D",
        Symbol("1w") => "1W",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/67edf117-6217-4cb8-95e7-9b03f314b1b1",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://openapi.blofin.com"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("rest") => "https://demo-trading-openapi.blofin.com"
        ),
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://blofin.com/register?referral_code=f79EsS",
            Symbol("discount") => 0.05
        ),
        Symbol("www") => "https://www.blofin.com",
        Symbol("doc") => "https://blofin.com/docs"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("market/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/books") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/mark-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/funding-rate-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/index-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/mark-price-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/position-tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("asset/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/withdrawal-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/deposit-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/positions-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/margin-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/position-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/leverage-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/batch-leverage-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/order-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders-tpsl-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/order-tpsl-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders-algo-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders-tpsl-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders-algo-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/fills-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/order/price-range") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("affiliate/basic") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("affiliate/referral-code") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("affiliate/invitees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("affiliate/sub-invitees") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("affiliate/sub-affiliates") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("affiliate/invitees/daily/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/account/positions-by-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/account/positions-details-by-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/account/positions-by-contract") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/account/position-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/account/leverage-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/orders-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/pending-tpsl-by-contract") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/position-history-by-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/pending-tpsl-by-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/query-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/trade/fills-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/demo-apply-money") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/set-margin-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/set-position-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/order-tpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/cancel-batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/cancel-tpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/cancel-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/close-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/account/set-position-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/account/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/place-tpsl-by-contract") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/cancel-tpsl-by-contract") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/place-tpsl-by-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/cancel-tpsl-by-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/close-position-by-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/trade/close-position-by-contract") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.00060"),
            Symbol("maker") => self.parseNumber("0.00020")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("password") => true
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1440
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("hedged") => false
            )
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => nothing,
                    Symbol("price") => true
                ),
                Symbol("hedged") => true
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
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("400") => BadRequest,
            Symbol("401") => AuthenticationError,
            Symbol("500") => ExchangeError,
            Symbol("404") => BadRequest,
            Symbol("405") => BadRequest,
            Symbol("406") => BadRequest,
            Symbol("429") => RateLimitExceeded,
            Symbol("152001") => BadRequest,
            Symbol("152002") => BadRequest,
            Symbol("152003") => BadRequest,
            Symbol("152004") => BadRequest,
            Symbol("152005") => BadRequest,
            Symbol("152006") => InvalidOrder,
            Symbol("152007") => InvalidOrder,
            Symbol("152008") => InvalidOrder,
            Symbol("152009") => InvalidOrder,
            Symbol("150003") => InvalidOrder,
            Symbol("150004") => InvalidOrder,
            Symbol("542") => InvalidOrder,
            Symbol("102002") => InvalidOrder,
            Symbol("102005") => InvalidOrder,
            Symbol("102014") => InvalidOrder,
            Symbol("102015") => InvalidOrder,
            Symbol("102022") => InvalidOrder,
            Symbol("102037") => InvalidOrder,
            Symbol("102038") => InvalidOrder,
            Symbol("102039") => InvalidOrder,
            Symbol("102040") => InvalidOrder,
            Symbol("102047") => InvalidOrder,
            Symbol("102048") => InvalidOrder,
            Symbol("102049") => InvalidOrder,
            Symbol("102050") => InvalidOrder,
            Symbol("102051") => InvalidOrder,
            Symbol("102052") => InvalidOrder,
            Symbol("102053") => InvalidOrder,
            Symbol("102054") => InvalidOrder,
            Symbol("102055") => InvalidOrder,
            Symbol("102064") => BadRequest,
            Symbol("102065") => BadRequest,
            Symbol("102068") => BadRequest,
            Symbol("103013") => ExchangeError,
            Symbol("Order failed. Insufficient USDT margin in account") => InsufficientFunds
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Internal Server Error") => ExchangeNotAvailable,
            Symbol("server error") => ExchangeNotAvailable
        )
    ),
    Symbol("httpExceptions") => Dict{Symbol, Any}(
        Symbol("429") => ExchangeNotAvailable
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("swap") => "futures",
            Symbol("funding") => "funding",
            Symbol("future") => "futures",
            Symbol("copy_trading") => "copy_trading",
            Symbol("earn") => "earn",
            Symbol("spot") => "spot"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("funding") => "funding",
            Symbol("futures") => "swap",
            Symbol("copy_trading") => "copy_trading",
            Symbol("earn") => "earn",
            Symbol("spot") => "spot"
        ),
        Symbol("defaultNetwork") => "ERC20",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("BTC") => "BTC",
            Symbol("USDT") => "TRC20"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "Bitcoin",
            Symbol("BEP20") => "BSC",
            Symbol("ERC20") => "ERC20",
            Symbol("TRC20") => "TRC20"
        ),
        Symbol("fetchOpenInterestHistory") => Dict{Symbol, Any}(
            Symbol("timeframes") => Dict{Symbol, Any}(
                Symbol("5m") => "5m",
                Symbol("1h") => "1H",
                Symbol("8h") => "8H",
                Symbol("1d") => "1D",
                Symbol("5M") => "5m",
                Symbol("1H") => "1H",
                Symbol("8H") => "8H",
                Symbol("1D") => "1D"
            )
        ),
        Symbol("defaultType") => "swap",
        Symbol("brokerId") => "ec6dd3a7dd982d0b",
        Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetTradeOrdersPending"
        ),
        Symbol("cancelOrders") => Dict{Symbol, Any}(
            Symbol("method") => "privatePostTradeCancelBatchOrders"
        ),
        Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetTradeOrdersHistory"
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("password") => nothing,
            Symbol("pwd") => nothing
        ),
        Symbol("exchangeType") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("swap") => "SWAP",
            Symbol("SPOT") => "SPOT",
            Symbol("SWAP") => "SWAP"
        )
    )
))

end
"""
retrieves data on all markets for blofin
see: https://blofin.com/docs#get-instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Blofin; params=Dict())
    response = Base.fetch(self.publicGetMarketInstruments(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseMarkets(data)

end
function parseMarket(self::Blofin, market)
    id = safeString(market, "instId");
    type_var = safeStringLower(market, "instType");
    spot = (type_var == "spot");
    future = (type_var == "future");
    swap = (type_var == "swap");
    option = (type_var == "option");
    contract = @functions.ccxt_or(swap, future);
    baseId = safeString(market, "baseCurrency");
    quoteId = safeString(market, "quoteCurrency");
    settleId = safeString(market, "settleCurrency", quoteId);
    settle = self.safeCurrencyCode(settleId);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(swap)
        symbol = string(symbol, ":", settle);
    end
    expiry = nothing;
    strikePrice = nothing;
    optionType = nothing;
    tickSize = safeString(market, "tickSize");
    fees = self.safeDict2(self.fees, type_var, "trading", defaultValue = Dict{Symbol, Any}());
    taker = self.safeNumber(fees, "taker");
    maker = self.safeNumber(fees, "maker");
    maxLeverage = safeString(market, "maxLeverage", "100");
    maxLeverage = stringMax(maxLeverage, "1");
    isActive = (safeString(market, "state") == "live");
    isMargin = @functions.ccxt_and(spot, (stringGt(maxLeverage, "1")));
    contractType = safeString(market, "contractType");
    maxLimitAmount = self.safeNumber(market, "maxLimitSize");
    maxSpotCost = self.safeNumber(market, "maxMarketSize");
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settle") => settle,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("option") => option,
    Symbol("margin") => isMargin,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("active") => isActive,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
    Symbol("contract") => contract,
    Symbol("linear") => functions.ccxtruthy(contract) ? (contractType == "linear") : nothing,
    Symbol("inverse") => functions.ccxtruthy(contract) ? (contractType == "inverse") : nothing,
    Symbol("contractSize") => functions.ccxtruthy(contract) ? self.safeNumber(market, "contractValue") : nothing,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => expiry,
    Symbol("strike") => strikePrice,
    Symbol("optionType") => optionType,
    Symbol("created") => safeInteger(market, "listTime"),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "lotSize"),
        Symbol("price") => self.parseNumber(tickSize)
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.parseNumber(maxLeverage)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minSize"),
            Symbol("max") => maxLimitAmount
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => functions.ccxtruthy(contract) ? nothing : maxSpotCost
        )
    ),
    Symbol("info") => market
))

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://blofin.com/docs#get-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Blofin, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    limit = functions.ccxtruthy((limit == nothing)) ? 50 : limit;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = Base.fetch(self.publicGetMarketBooks(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(first_var, "ts");
    return self.parseOrderBook(first_var, symbol, timestamp = timestamp)

end
function parseTicker(self::Blofin, ticker; market=nothing)
    timestamp = safeInteger(ticker, "ts");
    marketId = safeString(ticker, "instId");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    symbol = get(market, Symbol("symbol"), nothing);
    last_var = safeString(ticker, "last");
    open = safeString(ticker, "open24h");
    spot = self.safeBool(market, "spot", defaultValue = false);
    quoteVolume = functions.ccxtruthy(spot) ? safeString(ticker, "volCurrency24h") : nothing;
    baseVolume = safeString(ticker, "vol24h");
    high = safeString(ticker, "high24h");
    low = safeString(ticker, "low24h");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => safeString(ticker, "bidPrice"),
    Symbol("bidVolume") => safeString(ticker, "bidSize"),
    Symbol("ask") => safeString(ticker, "askPrice"),
    Symbol("askVolume") => safeString(ticker, "askSize"),
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("markPrice") => safeString(ticker, "markPrice"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://blofin.com/docs#get-tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Blofin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketTickers(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(first_var, market = market)

end
"""
fetches mark price for the market
see: https://docs.blofin.com/index.html#get-mark-price

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrice(self::Blofin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketMarkPrice(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(first_var, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://blofin.com/docs#get-tickers

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Blofin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetMarketTickers(params));
    tickers = self.safeList(response, "data", defaultValue = []);
    return self.parseTickers(tickers, symbols = symbols)

end
function parseTrade(self::Blofin, trade; market=nothing)
    id = safeString(trade, "tradeId");
    marketId = safeString(trade, "instId");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(trade, "ts");
    price = safeString2(trade, "price", "fillPrice");
    amount = safeString2(trade, "size", "fillSize");
    side = safeString(trade, "side");
    orderId = safeString(trade, "orderId");
    feeCost = safeString(trade, "fee");
    fee = nothing;
    feeCurrency = safeString(trade, "feeCurrency");
    isSpot = feeCurrency != nothing;
    if functions.ccxtruthy(feeCurrency == nothing)
        feeCurrency = get(market, Symbol("settle"), nothing);
    elseif functions.ccxtruthy(feeCurrency == "base_currency")
        feeCurrency = get(market, Symbol("base"), nothing);
    else
        if functions.ccxtruthy(feeCurrency == "quote_currency")
            feeCurrency = get(market, Symbol("quote"), nothing);
        end

    end
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrency
        );
    end
    if functions.ccxtruthy(isSpot)
        spotSymbol = string(get(market, Symbol("base"), nothing), "/", get(market, Symbol("quote"), nothing));
        cost = self.parseNumber(stringMul(price, amount));
        result = Dict{Symbol, Any}(
            Symbol("info") => trade,
            Symbol("timestamp") => timestamp,
            Symbol("datetime") => self.iso8601(timestamp),
            Symbol("symbol") => spotSymbol,
            Symbol("id") => id,
            Symbol("order") => orderId,
            Symbol("type") => nothing,
            Symbol("takerOrMaker") => nothing,
            Symbol("side") => side,
            Symbol("price") => self.parseNumber(price),
            Symbol("amount") => self.parseNumber(amount),
            Symbol("cost") => cost,
            Symbol("fee") => Dict{Symbol, Any}(
                Symbol("cost") => self.parseNumber(feeCost),
                Symbol("currency") => feeCurrency
            )
        );
            return result
    else
        return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market = market)
    end

end
"""
get the list of most recent trades for a particular symbol
see: https://blofin.com/docs#get-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: *only applies to publicGetMarketHistoryTrades* default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Blofin, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "tradeId", cursorSent = "after", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchTrades", "method", defaultValue = "publicGetMarketTrades");
    if functions.ccxtruthy(method == "publicGetMarketTrades")
        response = Base.fetch(self.publicGetMarketTrades(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
function parseOHLCV(self::Blofin, ohlcv; market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 6)]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://blofin.com/docs#get-candlesticks

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
function fetchOHLCV(self::Blofin, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 100))
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("bar") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("limit") => limit
    );
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("after")] = until;
        params = omit(params, "until");
    end
    response = Base.fetch(self.publicGetMarketCandles(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
fetches historical funding rate prices
see: https://blofin.com/docs#get-funding-rate-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: timestamp in ms of the latest funding rate to fetch

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Blofin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = "8h", params = params, maxEntriesPerRequest = 100))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = max(since - 1, 0);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("after")] = until;
        params = omit(params, "until");
    end
    response = Base.fetch(self.publicGetMarketFundingRateHistory(extend(request, params)));
    rates = [];
    data = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        rate = get(data, i + 1, nothing);
        timestamp = safeInteger(rate, "fundingTime");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => rate,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(rate, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = get(market, Symbol("symbol"), nothing), since = since, limit = limit)

end
function parseFundingRate(self::Blofin, contract; market=nothing)
    marketId = safeString(contract, "instId");
    symbol = self.safeSymbol(marketId, market = market);
    fundingTime = safeInteger(contract, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => self.parseNumber("0"),
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("fundingTimestamp") => fundingTime,
    Symbol("fundingDatetime") => self.iso8601(fundingTime),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
"""
fetch the current funding rate
see: https://blofin.com/docs#get-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Blofin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(ExchangeError(string(self.id, " fetchFundingRate() is only valid for swap markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketFundingRate(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    entry = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseFundingRate(entry, market = market)

end
function parseBalanceByType(self::Blofin, response)
    data = self.safeList(response, "data");
    if functions.ccxtruthy(@functions.ccxt_and((data != nothing), functions.ccxt_isArray(data)))
            return self.parseFundingBalance(response)
    else
        return self.parseBalance(response)
    end

end
function parseBalance(self::Blofin, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(data, "ts");
    details = self.safeList(data, "details", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(details)))
        balance = get(details, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        eq = safeString(balance, "equity");
        availEq = safeString(balance, "available");
        if functions.ccxtruthy(@functions.ccxt_or((eq == nothing), (availEq == nothing)))
            account[Symbol("free")] = safeString(balance, "availableEquity");
            account[Symbol("used")] = safeString(balance, "frozen");
        else
            account[Symbol("total")] = eq;
            account[Symbol("free")] = availEq;
        end
        result[Symbol(code)] = account;
        i += 1
    end
    result[Symbol("timestamp")] = timestamp;
    result[Symbol("datetime")] = self.iso8601(timestamp);
    return self.safeBalance(result)

end
function parseFundingBalance(self::Blofin, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    data = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        balance = get(data, i + 1, nothing);
        currencyId = safeString(balance, "currency");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "balance");
        account[Symbol("free")] = safeString(balance, "available");
        account[Symbol("used")] = safeString(balance, "frozen");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function parseTradingFee(self::Blofin, fee; market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("maker") => self.parseNumber(stringNeg(safeString2(fee, "maker", "makerU"))),
    Symbol("taker") => self.parseNumber(stringNeg(safeString2(fee, "taker", "takerU"))),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://blofin.com/docs#get-balance
see: https://blofin.com/docs#get-futures-account-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: the type of account to fetch the balance for, either 'funding' or 'futures'  or 'copy_trading' or 'earn'

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Blofin; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountType = nothing;
    (accountType, params) = self.handleOptionAndParams2(params, "fetchBalance", "accountType", "type");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_and(accountType != nothing, accountType != "swap"))
        options = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
        parsedAccountType = safeString(options, accountType, accountType);
        request[Symbol("accountType")] = parsedAccountType;
        response = Base.fetch(self.privateGetAssetBalances(extend(request, params)));
    else
        response = Base.fetch(self.privateGetAccountBalance(extend(request, params)));
    end
    return self.parseBalanceByType(response)

end
function createOrderRequest(self::Blofin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("orderType") => type_var,
        Symbol("size") => self.amountToPrecision(symbol, amount),
        Symbol("brokerId") => safeString(self.options, "brokerId", "ec6dd3a7dd982d0b")
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params, defaultValue = "cross");
    request[Symbol("marginMode")] = marginMode;
    triggerPriceAny = safeStringN(params, ["triggerPrice", "stopLossPrice", "takeProfitPrice"]);
    triggerPriceSlTp = safeString2(params, "stopLossPrice", "takeProfitPrice");
    timeInForce = safeString(params, "timeInForce", "GTC");
    isHedged = self.safeBool(params, "hedged", defaultValue = false);
    if functions.ccxtruthy(isHedged)
        request[Symbol("positionSide")] = functions.ccxtruthy((side == "buy")) ? "long" : "short";
    end
    isMarketOrder = type_var == "market";
    params = omit(params, ["timeInForce"]);
    ioc = @functions.ccxt_or((timeInForce == "IOC"), (type_var == "ioc"));
    marketIOC = (@functions.ccxt_and(isMarketOrder, ioc));
    if functions.ccxtruthy(@functions.ccxt_or(isMarketOrder, marketIOC))
        request[Symbol("orderType")] = "market";
    else
        key = functions.ccxtruthy((triggerPriceAny != nothing)) ? "orderPrice" : "price";
        request[Symbol(key)] = self.priceToPrecision(symbol, price);
    end
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(isMarketOrder, type_var == "post_only", params = params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("type")] = "post_only";
    end
    stopLoss = self.safeDict(params, "stopLoss");
    takeProfit = self.safeDict(params, "takeProfit");
    params = omit(params, ["stopLoss", "takeProfit", "hedged"]);
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
        if functions.ccxtruthy(hasStopLoss)
            slTriggerPrice = safeString2(stopLoss, "triggerPrice", "stopPrice");
            request[Symbol("slTriggerPrice")] = self.priceToPrecision(symbol, slTriggerPrice);
            slOrderPrice = safeString(stopLoss, "price", "-1");
            request[Symbol("slOrderPrice")] = self.priceToPrecision(symbol, slOrderPrice);
        end
        if functions.ccxtruthy(hasTakeProfit)
            tpTriggerPrice = safeString2(takeProfit, "triggerPrice", "stopPrice");
            request[Symbol("tpTriggerPrice")] = self.priceToPrecision(symbol, tpTriggerPrice);
            tpPrice = safeString(takeProfit, "price", "-1");
            request[Symbol("tpOrderPrice")] = self.priceToPrecision(symbol, tpPrice);
        end
    elseif functions.ccxtruthy(triggerPriceAny != nothing)
        request[Symbol("orderType")] = "trigger";
        request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPriceAny);
        if functions.ccxtruthy(isMarketOrder)
            request[Symbol("orderPrice")] = "-1";
        end
        if functions.ccxtruthy(triggerPriceSlTp != nothing)
            request[Symbol("reduceOnly")] = true;
        end
        params = omit(params, ["stopLossPrice", "takeProfitPrice", "triggerPrice"]);
    end
    return extend(request, params)

end
function parseOrderStatus(self::Blofin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("canceled") => "canceled",
        Symbol("order_failed") => "canceled",
        Symbol("live") => "open",
        Symbol("partially_filled") => "open",
        Symbol("filled") => "closed",
        Symbol("effective") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Blofin, order; market=nothing)
    id = safeStringN(order, ["tpslId", "orderId", "algoId"]);
    timestamp = safeInteger(order, "createTime");
    lastUpdateTimestamp = safeInteger(order, "updateTime");
    lastTradeTimestamp = safeInteger(order, "fillTime");
    side = safeString(order, "side");
    type_var = safeString(order, "orderType");
    postOnly = nothing;
    timeInForce = nothing;
    if functions.ccxtruthy(type_var == "post_only")
        postOnly = true;
        type_var = "limit";
    elseif functions.ccxtruthy(type_var == "fok")
        timeInForce = "FOK";
        type_var = "limit";
    else
        if functions.ccxtruthy(type_var == "ioc")
            timeInForce = "IOC";
            type_var = "limit";
        elseif functions.ccxtruthy(type_var == "conditional")
            type_var = "trigger";
        end

    end
    marketId = safeString(order, "instId");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = self.safeSymbol(marketId, market = market, delimiter = "-");
    filled = safeString(order, "filledSize");
    price = safeStringN(order, ["px", "price", "orderPrice"]);
    average = safeString(order, "averagePrice");
    status = self.parseOrderStatus(safeString(order, "state"));
    feeCostString = safeString(order, "fee");
    amount = safeString(order, "size");
    leverage = safeString(order, "leverage", "1");
    contractSize = safeString(market, "contractSize");
    baseAmount = stringMul(contractSize, filled);
    cost = nothing;
    if functions.ccxtruthy(average != nothing)
        cost = stringMul(average, baseAmount);
        cost = stringDiv(cost, leverage);
    end
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCostSigned = stringAbs(feeCostString);
        feeCurrencyId = safeString(order, "feeCcy", "USDT");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCostSigned),
            Symbol("currency") => feeCurrencyCode
        );
    end
    clientOrderId = safeString(order, "clientOrderId");
    if functions.ccxtruthy(@functions.ccxt_and((clientOrderId != nothing), (functions.ccxt_lt(length(clientOrderId), 1))))
        clientOrderId = nothing;
    end
    stopLossTriggerPrice = self.safeNumber(order, "slTriggerPrice");
    stopLossPrice = self.safeNumber(order, "slOrderPrice");
    takeProfitTriggerPrice = self.safeNumber(order, "tpTriggerPrice");
    takeProfitPrice = self.safeNumber(order, "tpOrderPrice");
    reduceOnlyRaw = safeString(order, "reduceOnly");
    reduceOnly = (reduceOnlyRaw == "true");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("stopLossTriggerPrice") => stopLossTriggerPrice,
    Symbol("takeProfitTriggerPrice") => takeProfitTriggerPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("average") => average,
    Symbol("cost") => cost,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing,
    Symbol("reduceOnly") => reduceOnly
), market = market)

end
"""
create a trade order
see: https://blofin.com/docs#place-order
see: https://blofin.com/docs#place-tpsl-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'post_only' or 'ioc' or 'fok'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::string, optional: the trigger price for a trigger order
- `params.reduceOnly`::bool, optional: a mark to reduce the position size for margin, swap and future orders
- `params.postOnly`::bool, optional: true to place a post only order
- `params.marginMode`::string, optional: 'cross' or 'isolated', default is 'cross'
- `params.stopLossPrice`::float, optional: stop loss trigger price (will use privatePostTradeOrderTpsl)
- `params.takeProfitPrice`::float, optional: take profit trigger price (will use privatePostTradeOrderTpsl)
- `params.positionSide`::string, optional: *stopLossPrice/takeProfitPrice orders only* 'long' or 'short' or 'net' default is 'net'
- `params.hedged`::bool, optional: if true, the positionSide will be set to long/short instead of net, default is false
- `params.clientOrderId`::string, optional: a unique id for the order
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.takeProfit.price`::float, optional: take profit order price (if not provided the order will be a market order)
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.stopLoss.price`::float, optional: stop loss order price (if not provided the order will be a market order)
- `params.tpsl`::float, optional: whether to force to send the order to the combined TPSL oco order endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Blofin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isStopLossPriceDefined = safeString(params, "stopLossPrice") != nothing;
    isTakeProfitPriceDefined = safeString(params, "takeProfitPrice") != nothing;
    isTriggerOrder = safeString(params, "triggerPrice") != nothing;
    isTpslEndpoint = false;
    (isTpslEndpoint, params) = self.handleOptionAndParams(params, "createOrder", "tpsl", defaultValue = false);
    isCombinedSlTp = @functions.ccxt_or((@functions.ccxt_and(isStopLossPriceDefined, isTakeProfitPriceDefined)), isTpslEndpoint);
    isSlOrTp = @functions.ccxt_or(isStopLossPriceDefined, isTakeProfitPriceDefined);
    reduceOnly = self.safeBool(params, "reduceOnly");
    if functions.ccxtruthy(reduceOnly != nothing)
        params[Symbol("reduceOnly")] = functions.ccxtruthy(reduceOnly) ? "true" : "false";
    end
    if functions.ccxtruthy(isCombinedSlTp)
        tpslRequest = self.createTpslOrderRequest(symbol, type_var, side, amount = amount, price = price, params = params);
        response = Base.fetch(self.privatePostTradeOrderTpsl(tpslRequest));
    elseif functions.ccxtruthy(@functions.ccxt_or(isTriggerOrder, isSlOrTp))
        triggerRequest = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
        response = Base.fetch(self.privatePostTradeOrderAlgo(triggerRequest));
    else
        request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
        response = Base.fetch(self.privatePostTradeOrder(request));
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isCombinedSlTp, isSlOrTp), isTriggerOrder))
        dataDict = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
            return self.parseOrder(dataDict, market = market)
    end
    data = self.safeList(response, "data", defaultValue = []);
    first_var = self.safeDict(data, 0);
    order = self.parseOrder(first_var, market = market);
    order[Symbol("type")] = type_var;
    order[Symbol("side")] = side;
    return order

end
function createTpslOrderRequest(self::Blofin, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    market = self.market(symbol);
    hedged = self.safeBool(params, "hedged", defaultValue = false);
    positionSide = "net";
    if functions.ccxtruthy(hedged)
        positionSide = functions.ccxtruthy((side == "buy")) ? "short" : "long";
    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("positionSide") => positionSide,
        Symbol("brokerId") => safeString(self.options, "brokerId", "ec6dd3a7dd982d0b"),
        Symbol("reduceOnly") => self.safeBool(params, "reduceOnly", defaultValue = true)
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("size")] = self.amountToPrecision(symbol, amount);
    end
    marginMode = safeString(params, "marginMode", "cross");
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != "cross", marginMode != "isolated"))
        throw(BadRequest(string(self.id, " createTpslOrder() requires a marginMode parameter that must be either cross or isolated")));
    end
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    if functions.ccxtruthy(stopLossPrice != nothing)
        request[Symbol("slTriggerPrice")] = self.priceToPrecision(symbol, stopLossPrice);
        if functions.ccxtruthy(type_var == "market")
            request[Symbol("slOrderPrice")] = "-1";
        else
            slLimitPrice = safeString(params, "stopLossLimitPrice");
            if functions.ccxtruthy(slLimitPrice == nothing)
                throw(ArgumentsRequired(string(self.id, " createTpslOrder() requires a \"stopLossLimitPrice\" parameter (instead of \"price\" argument) for stop loss orders when the order type is not market")));
            end
            request[Symbol("slOrderPrice")] = self.priceToPrecision(symbol, slLimitPrice);
            params = omit(params, "stopLossLimitPrice");
        end
    end
    if functions.ccxtruthy(takeProfitPrice != nothing)
        request[Symbol("tpTriggerPrice")] = self.priceToPrecision(symbol, takeProfitPrice);
        if functions.ccxtruthy(type_var == "market")
            request[Symbol("tpOrderPrice")] = "-1";
        else
            tpLimitPrice = safeString(params, "takeProfitLimitPrice");
            if functions.ccxtruthy(tpLimitPrice == nothing)
                throw(ArgumentsRequired(string(self.id, " createTpslOrder() requires a \"takeProfitLimitPrice\" parameter (instead of \"price\" argument) for take profit orders when the order type is not market")));
            end
            request[Symbol("tpOrderPrice")] = self.priceToPrecision(symbol, tpLimitPrice);
            params = omit(params, "takeProfitLimitPrice");
        end
    end
    request[Symbol("marginMode")] = marginMode;
    params = omit(params, ["stopLossPrice", "takeProfitPrice", "reduceOnly", "hedged"]);
    return extend(request, params)

end
"""
cancels an open order
see: https://blofin.com/docs#cancel-order
see: https://blofin.com/docs#cancel-tpsl-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: True if cancelling a trigger/conditional
- `params.tpsl`::bool, optional: True if cancelling a tpsl order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Blofin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    isTrigger = self.safeBool(params, "trigger", defaultValue = false);
    isTpsl = self.safeBool2(params, "tpsl", "TPSL", defaultValue = false);
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOrderId")] = clientOrderId;
    else
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isTrigger), !functions.ccxtruthy(isTpsl)))
            request[Symbol("orderId")] =             string(id);
        elseif functions.ccxtruthy(isTpsl)
            request[Symbol("tpslId")] =             string(id);
        else
            if functions.ccxtruthy(isTrigger)
                request[Symbol("algoId")] =                 string(id);
            end

        end
    end
    query = omit(params, ["orderId", "clientOrderId", "stop", "trigger", "tpsl"]);
    if functions.ccxtruthy(isTpsl)
        tpslResponse = Base.fetch(self.cancelOrders([id], symbol = symbol, params = params));
        first_var = self.safeDict(tpslResponse, 0);
            return first_var
    elseif functions.ccxtruthy(isTrigger)
        triggerResponse = Base.fetch(self.privatePostTradeCancelAlgo(extend(request, query)));
        triggerData = self.safeDict(triggerResponse, "data");
        return self.parseOrder(triggerData, market = market)
    end
    response = Base.fetch(self.privatePostTradeCancelOrder(extend(request, query)));
    data = self.safeList(response, "data", defaultValue = []);
    order = self.safeDict(data, 0);
    return self.parseOrder(order, market = market)

end
"""
create a list of trade orders
see: https://blofin.com/docs#place-multiple-orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Blofin, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        extendedParams = extend(orderParams, params);
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price = price, params = extendedParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    response = Base.fetch(self.privatePostTradeBatchOrders(ordersRequests));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data)

end
"""
Fetch orders that are still open
see: https://blofin.com/docs#get-active-orders
see: https://blofin.com/docs#get-active-tpsl-orders
see: https://docs.blofin.com/index.html#get-active-algo-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: True if fetching trigger or conditional orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Blofin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOpenOrders", symbol = symbol, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    isTrigger = self.safeBoolN(params, ["stop", "trigger"], defaultValue = false);
    isTpSl = self.safeBool2(params, "tpsl", "TPSL", defaultValue = false);
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "method", defaultValue = "privateGetTradeOrdersPending");
    query = omit(params, ["method", "stop", "trigger", "tpsl", "TPSL"]);
    if functions.ccxtruthy(@functions.ccxt_or(isTpSl, (method == "privateGetTradeOrdersTpslPending")))
        response = Base.fetch(self.privateGetTradeOrdersTpslPending(extend(request, query)));
    elseif functions.ccxtruthy(@functions.ccxt_or(isTrigger, (method == "privateGetTradeOrdersAlgoPending")))
        request[Symbol("orderType")] = "trigger";
        response = Base.fetch(self.privateGetTradeOrdersAlgoPending(extend(request, query)));
    else
        response = Base.fetch(self.privateGetTradeOrdersPending(extend(request, query)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://blofin.com/docs#get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: Timestamp in ms of the latest time to retrieve trades for
- `params.type`::string, optional: 'swap' or 'spot' (defaults to 'swap'), required to fetch spot trade history
- `params.instId`::string, optional: *spot markets only* the market id of the spot market to fetch the trade history for (e.g. 'BTC-USDT')
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Blofin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    (request, params) = self.handleUntilOption("end", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    type_var = "swap";
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params, defaultValue = type_var);
    if functions.ccxtruthy(type_var == "spot")
        request[Symbol("instType")] = "SPOT";
        response = Base.fetch(self.privateGetSpotTradeFillsHistory(extend(request, params)));
    else
        response = Base.fetch(self.privateGetTradeFillsHistory(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
fetch all deposits made to an account
see: https://blofin.com/docs#get-deposite-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Blofin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
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
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = max(since - 1, 0);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("after", request, params);
    response = Base.fetch(self.privateGetAssetDepositHistory(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit, params = params)

end
"""
fetch all withdrawals made from an account
see: https://blofin.com/docs#get-withdraw-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Blofin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchWithdrawals", symbol = code, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = max(since - 1, 0);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("after", request, params);
    response = Base.fetch(self.privateGetAssetWithdrawalHistory(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit, params = params)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://blofin.com/docs#get-funds-transfer-history

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Blofin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLedger", symbol = code, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.privateGetAssetBills(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseLedger(data, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Blofin, transaction; currency=nothing)
    type_var = nothing;
    id = nothing;
    status = nothing;
    withdrawalId = safeString(transaction, "withdrawId");
    depositId = safeString(transaction, "depositId");
    addressTo = safeString(transaction, "address");
    address = addressTo;
    tagTo = safeString(transaction, "tag");
    if functions.ccxtruthy(withdrawalId != nothing)
        type_var = "withdrawal";
        id = withdrawalId;
        status = self.parseTransactionWithdrawalStatus(safeString(transaction, "state"));
    else
        id = depositId;
        type_var = "deposit";
        status = self.parseTransactionDepositStatus(safeString(transaction, "state"));
    end
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId);
    amount = self.safeNumber(transaction, "amount");
    txid = safeString(transaction, "txId");
    timestamp = safeInteger(transaction, "ts");
    feeCurrencyId = safeString(transaction, "feeCurrency");
    feeCode = self.safeCurrencyCode(feeCurrencyId);
    feeCost = self.safeNumber(transaction, "fee");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("network") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => addressTo,
    Symbol("address") => address,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tagTo,
    Symbol("tag") => tagTo,
    Symbol("status") => status,
    Symbol("type") => type_var,
    Symbol("updated") => nothing,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => feeCode,
        Symbol("cost") => feeCost
    )
)

end
function parseTransactionWithdrawalStatus(self::Blofin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "pending",
        Symbol("2") => "failed",
        Symbol("3") => "ok",
        Symbol("4") => "failed",
        Symbol("6") => "pending",
        Symbol("7") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseTransactionDepositStatus(self::Blofin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "pending",
        Symbol("1") => "ok",
        Symbol("2") => "failed",
        Symbol("3") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseLedgerEntryType(self::Blofin, type_var)
    types = Dict{Symbol, Any}(
        Symbol("1") => "transfer",
        Symbol("2") => "trade",
        Symbol("3") => "trade",
        Symbol("4") => "rebate",
        Symbol("5") => "trade",
        Symbol("6") => "transfer",
        Symbol("7") => "trade",
        Symbol("8") => "fee",
        Symbol("9") => "trade",
        Symbol("10") => "trade",
        Symbol("11") => "trade"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Blofin, item; currency=nothing)
    currencyId = safeString(item, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    timestamp = safeInteger(item, "ts");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "transferId"),
    Symbol("direction") => nothing,
    Symbol("account") => nothing,
    Symbol("referenceId") => safeString(item, "clientId"),
    Symbol("referenceAccount") => nothing,
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "type")),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(item, "amount"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => "ok",
    Symbol("fee") => nothing
), currency = currency)

end
function parseIds(self::Blofin, ids)
    if functions.ccxtruthy(isa(ids, AbstractString))
            return split(ids, ",")
    else
        return ids
    end

end
"""
cancel multiple orders
see: https://blofin.com/docs#cancel-multiple-orders

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: whether the order is a stop/trigger order

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Blofin, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = [];
    method = self.handleOption("cancelOrders", "method", defaultValue = "privatePostTradeCancelBatchOrders");
    clientOrderIds = self.parseIds(safeValue(params, "clientOrderId"));
    tpslIds = self.parseIds(safeValue(params, "tpslId"));
    trigger = self.safeBoolN(params, ["stop", "trigger", "tpsl"]);
    if functions.ccxtruthy(trigger)
        method = "privatePostTradeCancelTpsl";
    end
    if functions.ccxtruthy(clientOrderIds == nothing)
        ids = self.parseIds(ids);
        if functions.ccxtruthy(tpslIds != nothing)
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(tpslIds)))
                push!(request, Dict{Symbol, Any}(
    Symbol("tpslId") => get(tpslIds, i + 1, nothing),
    Symbol("instId") => get(market, Symbol("id"), nothing)
));
                i += 1
            end

        end
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
            if functions.ccxtruthy(trigger)
                                push!(request, Dict{Symbol, Any}(
    Symbol("tpslId") => get(ids, i + 1, nothing),
    Symbol("instId") => get(market, Symbol("id"), nothing)
));
            else
                push!(request, Dict{Symbol, Any}(
    Symbol("orderId") => get(ids, i + 1, nothing),
    Symbol("instId") => get(market, Symbol("id"), nothing)
));
            end
            i += 1
        end

    else
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(clientOrderIds)))
            push!(request, Dict{Symbol, Any}(
    Symbol("instId") => get(market, Symbol("id"), nothing),
    Symbol("clientOrderId") => get(clientOrderIds, i + 1, nothing)
));
            i += 1
        end
    end
    if functions.ccxtruthy(method == "privatePostTradeCancelTpsl")
        response = Base.fetch(self.privatePostTradeCancelTpsl(request));
    else
        response = Base.fetch(self.privatePostTradeCancelBatchOrders(request));
    end
    ordersData = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(ordersData, market = market, since = nothing, limit = nothing, params = params)

end
"""
transfer currency internally between wallets on the same account
see: https://blofin.com/docs#funds-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from (funding, swap, copy_trading, earn)
- `toAccount`::string: account to transfer to (funding, swap, copy_trading, earn)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Blofin, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("fromAccount") => fromId,
        Symbol("toAccount") => toId
    );
    response = Base.fetch(self.privatePostAssetTransfer(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransfer(data, currency = currency)

end
function parseTransfer(self::Blofin, transfer; currency=nothing)
    id = safeString(transfer, "transferId");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => id,
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
fetch data on a single open contract trade position
see: https://blofin.com/docs#get-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.instType`::string, optional: MARGIN, SWAP, FUTURES, OPTION

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Blofin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetAccountPositions(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    position = self.safeDict(data, 0);
    if functions.ccxtruthy(position == nothing)
        throw(NullResponse(string(self.id, " fetchPosition() returned empty position")));
    end
    return self.parsePosition(position, market = market)

end
"""
fetch data on a single open contract trade position
see: https://blofin.com/docs#get-positions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.instType`::string, optional: MARGIN, SWAP, FUTURES, OPTION

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Blofin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.privateGetAccountPositions(params));
    data = self.safeList(response, "data", defaultValue = []);
    result = self.parsePositions(data);
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
"""
fetches historical positions
see: https://docs.blofin.com/index.html#get-positions-history

# Arguments
- `symbols`::array, optional: unified contract symbols
- `since`::int, optional: timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months
- `limit`::int, optional: the maximum amount of records to fetch, default=20, max=100
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months
- `params.productType`::string, optional: USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsHistory(self::Blofin; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 0)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("instId")] = get(market, Symbol("id"), nothing);
        end
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("begin")] = since;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = Base.fetch(self.privateGetAccountPositionsHistory(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    positions = self.parsePositions(data, symbols = symbols, params = params);
    return self.filterBySinceLimit(positions, since = since, limit = limit)

end
function parsePosition(self::Blofin, position; market=nothing)
    marketId = safeString(position, "instId");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    pos = safeString(position, "positions");
    contractsAbs = stringAbs(pos);
    side = safeString(position, "positionSide");
    hedged = side != "net";
    contracts = self.parseNumber(contractsAbs);
    if functions.ccxtruthy(pos != nothing)
        if functions.ccxtruthy(side == "net")
            if functions.ccxtruthy(stringGt(pos, "0"))
                side = "long";
            elseif functions.ccxtruthy(stringLt(pos, "0"))
                side = "short";
            else
                side = nothing;
            end
        end
    end
    contractSize = self.safeNumber(market, "contractSize");
    contractSizeString = numberToString(contractSize);
    markPriceString = safeString(position, "markPrice");
    notionalString = safeString(position, "notionalUsd");
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        notionalString = stringDiv(stringMul(contractsAbs, contractSizeString), markPriceString);
    end
    notional = self.parseNumber(notionalString);
    marginMode = safeString(position, "marginMode");
    initialMarginString = nothing;
    entryPriceString = safeString2(position, "averagePrice", "openAveragePrice");
    unrealizedPnlString = safeString(position, "unrealizedPnl");
    leverageString = safeString(position, "leverage");
    initialMarginPercentage = nothing;
    collateralString = nothing;
    if functions.ccxtruthy(marginMode == "cross")
        initialMarginString = safeString(position, "initialMargin");
        collateralString = stringAdd(initialMarginString, unrealizedPnlString);
    elseif functions.ccxtruthy(marginMode == "isolated")
        initialMarginPercentage = stringDiv("1", leverageString);
        collateralString = safeString(position, "margin");
    end
    maintenanceMarginString = safeString(position, "maintenanceMargin");
    maintenanceMargin = self.parseNumber(maintenanceMarginString);
    maintenanceMarginPercentageString = stringDiv(maintenanceMarginString, notionalString);
    if functions.ccxtruthy(initialMarginPercentage == nothing)
        initialMarginPercentage = self.parseNumber(stringDiv(initialMarginString, notionalString, 4));
    elseif functions.ccxtruthy(initialMarginString == nothing)
        initialMarginPercentageString = numberToString(initialMarginPercentage);
        initialMarginString = stringMul(initialMarginPercentageString, notionalString);
    end
    rounder = "0.00005";
    maintenanceMarginPercentage = self.parseNumber(stringDiv(stringAdd(maintenanceMarginPercentageString, rounder), "1", 4));
    liquidationPrice = self.safeNumber(position, "liquidationPrice");
    percentageString = safeString(position, "unrealizedPnlRatio");
    percentage = self.parseNumber(stringMul(percentageString, "100"));
    timestamp = safeInteger(position, "updateTime");
    marginRatio = self.parseNumber(stringDiv(maintenanceMarginString, collateralString, 4));
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("notional") => notional,
    Symbol("marginMode") => marginMode,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("entryPrice") => self.parseNumber(entryPriceString),
    Symbol("exitPrice") => self.safeNumber(position, "closeAveragePrice"),
    Symbol("unrealizedPnl") => self.parseNumber(unrealizedPnlString),
    Symbol("realizedPnl") => self.safeNumber(position, "realizedPnl"),
    Symbol("percentage") => percentage,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => contractSize,
    Symbol("markPrice") => self.parseNumber(markPriceString),
    Symbol("lastPrice") => nothing,
    Symbol("side") => side,
    Symbol("hedged") => hedged,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("maintenanceMargin") => maintenanceMargin,
    Symbol("maintenanceMarginPercentage") => maintenanceMarginPercentage,
    Symbol("collateral") => self.parseNumber(collateralString),
    Symbol("initialMargin") => self.parseNumber(initialMarginString),
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentage),
    Symbol("leverage") => self.parseNumber(leverageString),
    Symbol("marginRatio") => marginRatio,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
fetch the set leverage for all contract markets
see: https://docs.blofin.com/index.html#get-multiple-leverage

# Arguments
- `symbols`::array: a list of unified market symbols, required on blofin
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverages(self::Blofin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbols == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLeverages() requires a symbols argument")));
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchLeverages", params = params);
    if functions.ccxtruthy(marginMode == nothing)
        marginMode = safeString(params, "marginMode", "cross");
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "cross"), (marginMode != "isolated")))
        throw(BadRequest(string(self.id, " fetchLeverages() requires a marginMode parameter that must be either cross or isolated")));
    end
    symbols = self.marketSymbols(symbols = symbols);
    symbolsList = symbols;
    instIds = "";
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbolsList)))
        entry = get(symbolsList, i + 1, nothing);
        entryMarket = self.market(entry);
        if functions.ccxtruthy(functions.ccxt_gt(i, 0))
            instIds = string(instIds, ", ", get(entryMarket, Symbol("id"), nothing));
        else
            instIds = string(instIds, get(entryMarket, Symbol("id"), nothing));
        end
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => instIds,
        Symbol("marginMode") => marginMode
    );
    response = Base.fetch(self.privateGetAccountBatchLeverageInfo(extend(request, params)));
    leverages = self.safeList(response, "data", defaultValue = []);
    return self.parseLeverages(leverages, symbols = symbols, symbolKey = "instId")

end
"""
fetch the set leverage for a market
see: https://docs.blofin.com/index.html#get-leverage

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Blofin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchLeverage", params = params);
    if functions.ccxtruthy(marginMode == nothing)
        marginMode = safeString(params, "marginMode", "cross");
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "cross"), (marginMode != "isolated")))
        throw(BadRequest(string(self.id, " fetchLeverage() requires a marginMode parameter that must be either cross or isolated")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("marginMode") => marginMode
    );
    response = Base.fetch(self.privateGetAccountLeverageInfo(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseLeverage(data, market = market)

end
function parseLeverage(self::Blofin, leverage; market=nothing)
    marketId = safeString(leverage, "instId");
    leverageValue = safeInteger(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => safeStringLower(leverage, "marginMode"),
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
"""
set the level of leverage for a market
see: https://blofin.com/docs#set-leverage

# Arguments
- `leverage`::int: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'
- `params.positionSide`::string, optional: 'long' or 'short' - required for hedged mode in isolated margin

# Returns
- response from the exchange
"""
function setLeverage(self::Blofin, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 125))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between 1 and 125")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params = params, defaultValue = "cross");
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "cross"), (marginMode != "isolated")))
        throw(BadRequest(string(self.id, " setLeverage() requires a marginMode parameter that must be either cross or isolated")));
    end
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage,
        Symbol("marginMode") => marginMode,
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostAccountSetLeverage(extend(request, params)));
    return response

end
"""
closes open positions for a market
see: https://blofin.com/docs#close-positions

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: 'buy' or 'sell', leave as undefined in net mode
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique identifier for the order
- `params.marginMode`::string, optional: 'cross' or 'isolated', default is 'cross;
- `params.code`::string, optional: *required in the case of closing cross MARGIN position for Single-currency margin* margin currency EXCHANGE SPECIFIC PARAMETERS
- `params.autoCxl`::bool, optional: whether any pending orders for closing out needs to be automatically canceled when close position via a market order. false or true, the default is false
- `params.tag`::string, optional: order tag a combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters

# Returns
- [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function closePosition(self::Blofin, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString(params, "clientOrderId");
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("closePosition", params = params, defaultValue = "cross");
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("marginMode") => marginMode
    );
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOrderId")] = clientOrderId;
    end
    response = Base.fetch(self.privatePostTradeClosePosition(extend(request, params)));
    return self.safeDict(response, "data")

end
"""
fetches information on multiple closed orders made by the user
see: https://blofin.com/docs#get-order-history
see: https://blofin.com/docs#get-tpsl-order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of  orde structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: True if fetching trigger or conditional orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Blofin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchClosedOrders", symbol = symbol, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("begin")] = since;
    end
    isTrigger = self.safeBoolN(params, ["stop", "trigger", "tpsl", "TPSL"], defaultValue = false);
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "method", defaultValue = "privateGetTradeOrdersHistory");
    query = omit(params, ["method", "stop", "trigger", "tpsl", "TPSL"]);
    if functions.ccxtruthy(@functions.ccxt_or((isTrigger), (method == "privateGetTradeOrdersTpslHistory")))
        response = Base.fetch(self.privateGetTradeOrdersTpslHistory(extend(request, query)));
    else
        response = Base.fetch(self.privateGetTradeOrdersHistory(extend(request, query)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches the margin mode of a trading pair
see: https://docs.blofin.com/index.html#get-margin-mode

# Arguments
- `symbol`::string: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginMode(self::Blofin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = Base.fetch(self.privateGetAccountMarginMode(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginMode(data, market = market)

end
function parseMarginMode(self::Blofin, marginMode; market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => safeString(marginMode, "marginMode")
)

end
"""
set margin mode to 'cross' or 'isolated'
see: https://docs.blofin.com/index.html#set-margin-mode

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string, optional: unified market symbol (not used in blofin setMarginMode)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Blofin, marginMode; symbol=nothing, params=Dict())
    self.checkRequiredArgument("setMarginMode", marginMode, "marginMode", options = ["cross", "isolated"]);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("marginMode") => marginMode
    );
    response = Base.fetch(self.privatePostAccountSetMarginMode(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginMode(data, market = market)

end
"""
fetchs the position mode, hedged or one way
see: https://docs.blofin.com/index.html#get-position-mode

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the position mode for (not used in blofin fetchPositionMode)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
function fetchPositionMode(self::Blofin; symbol=nothing, params=Dict())
    response = Base.fetch(self.privateGetAccountPositionMode(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    positionMode = safeString(data, "positionMode");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("hedged") => positionMode == "long_short_mode"
)

end
"""
set hedged to true or false for a market
see: https://docs.blofin.com/index.html#set-position-mode

# Arguments
- `hedged`::bool: set to true to use hedged mode, false for one-way mode
- `symbol`::string, optional: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setPositionMode(self::Blofin, hedged; symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("positionMode") => functions.ccxtruthy(hedged) ? "long_short_mode" : "net_mode"
    );
    return Base.fetch(self.privatePostAccountSetPositionMode(extend(request, params)))

end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols
see: https://docs.blofin.com/index.html#get-positions

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [auto de leverage structures]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
function fetchPositionsADLRank(self::Blofin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    response = Base.fetch(self.privateGetAccountPositions(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseADLRanks(data, symbols = symbols)

end
function parseADLRank(self::Blofin, info; market=nothing)
    marketId = safeString(info, "instId");
    timestamp = self.safeIntegerOmitZero(info, "createTime");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("rank") => safeInteger(info, "adl"),
    Symbol("rating") => nothing,
    Symbol("percentage") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function handleErrors(self::Blofin, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    code = safeString(response, "code");
    message = safeString(response, "msg");
    feedback = string(self.id, " ", body);
    if functions.ccxtruthy(@functions.ccxt_and(code != nothing, code != "0"))
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    data = self.safeList(response, "data");
    first_var = self.safeDict(data, 0);
    insideMsg = safeString(first_var, "msg");
    insideCode = safeString(first_var, "code");
    if functions.ccxtruthy(@functions.ccxt_and(insideCode != nothing, insideCode != "0"))
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), insideCode, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), insideMsg, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), insideMsg, feedback);
    end
    return nothing

end
function sign(self::Blofin, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    request = string("/api/", self.version, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), request);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(!functions.ccxtruthy(isEmpty(query)))
            url += string("?", self.urlencode(query));
        end
    elseif functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = string(milliseconds());
        headers = Dict{Symbol, Any}(
            Symbol("ACCESS-KEY") => self.apiKey,
            Symbol("ACCESS-PASSPHRASE") => self.password,
            Symbol("ACCESS-TIMESTAMP") => timestamp,
            Symbol("ACCESS-NONCE") => timestamp
        );
        sign_body = "";
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(!functions.ccxtruthy(isEmpty(query)))
                urlencodedQuery = string("?", self.urlencode(query));
                url += urlencodedQuery;
                request += urlencodedQuery;
            end
        else
            if functions.ccxtruthy(!functions.ccxtruthy(isEmpty(query)))
                body = json(query);
                sign_body = body;
            end
            headers[Symbol("Content-Type")] = "application/json";
        end
        auth = string(request, method, timestamp, timestamp, sign_body);
        signature = self.stringToBase64(self.hmac(self.encode(auth), self.encode(self.secret), sha256));
        headers[Symbol("ACCESS-SIGN")] = signature;
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
Base.getproperty(self::Blofin, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarketInstruments(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/instruments"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketTickers(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketBooks(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/books"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketTrades(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketMarkPrice(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/mark-price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketFundingRate(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/funding-rate"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketFundingRateHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/funding-rate-history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketCandles(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketIndexCandles(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/index-candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketMarkPriceCandles(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/mark-price-candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketPositionTiers(self::Blofin, params=Dict(), context=Dict())
    return request(self, "market/position-tiers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetBalances(self::Blofin, params=Dict(), context=Dict())
    return request(self, "asset/balances"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetBills(self::Blofin, params=Dict(), context=Dict())
    return request(self, "asset/bills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetWithdrawalHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "asset/withdrawal-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetDepositHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "asset/deposit-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountConfig(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/config"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetCurrencies(self::Blofin, params=Dict(), context=Dict())
    return request(self, "asset/currencies"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountBalance(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountPositions(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/positions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountPositionsHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/positions-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountMarginMode(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/margin-mode"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountPositionMode(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/position-mode"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountLeverageInfo(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/leverage-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountBatchLeverageInfo(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/batch-leverage-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrdersPending(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/orders-pending"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrderDetail(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/order-detail"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrdersTpslPending(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/orders-tpsl-pending"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrderTpslDetail(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/order-tpsl-detail"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrdersAlgoPending(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/orders-algo-pending"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrdersHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/orders-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrdersTpslHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/orders-tpsl-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrdersAlgoHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/orders-algo-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeFillsHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/fills-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeOrderPriceRange(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/order/price-range"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAffiliateBasic(self::Blofin, params=Dict(), context=Dict())
    return request(self, "affiliate/basic"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAffiliateReferralCode(self::Blofin, params=Dict(), context=Dict())
    return request(self, "affiliate/referral-code"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAffiliateInvitees(self::Blofin, params=Dict(), context=Dict())
    return request(self, "affiliate/invitees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAffiliateSubInvitees(self::Blofin, params=Dict(), context=Dict())
    return request(self, "affiliate/sub-invitees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAffiliateSubAffiliates(self::Blofin, params=Dict(), context=Dict())
    return request(self, "affiliate/sub-affiliates"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAffiliateInviteesDailyInfo(self::Blofin, params=Dict(), context=Dict())
    return request(self, "affiliate/invitees/daily/info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingInstruments(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/instruments"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingConfig(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/config"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingAccountBalance(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/account/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingAccountPositionsByOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/account/positions-by-order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingAccountPositionsDetailsByOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/account/positions-details-by-order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingAccountPositionsByContract(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/account/positions-by-contract"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingAccountPositionMode(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/account/position-mode"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingAccountLeverageInfo(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/account/leverage-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingTradeOrdersPending(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/orders-pending"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingTradePendingTpslByContract(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/pending-tpsl-by-contract"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingTradePositionHistoryByOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/position-history-by-order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingTradeOrdersHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/orders-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetCopytradingTradePendingTpslByOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/pending-tpsl-by-order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserQueryApikey(self::Blofin, params=Dict(), context=Dict())
    return request(self, "user/query-apikey"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotTradeFillsHistory(self::Blofin, params=Dict(), context=Dict())
    return request(self, "spot/trade/fills-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAssetTransfer(self::Blofin, params=Dict(), context=Dict())
    return request(self, "asset/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAssetDemoApplyMoney(self::Blofin, params=Dict(), context=Dict())
    return request(self, "asset/demo-apply-money"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountSetMarginMode(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/set-margin-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountSetPositionMode(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/set-position-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountSetLeverage(self::Blofin, params=Dict(), context=Dict())
    return request(self, "account/set-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeBatchOrders(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/batch-orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeOrderTpsl(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/order-tpsl"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeOrderAlgo(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/order-algo"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeCancelOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/cancel-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeCancelBatchOrders(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/cancel-batch-orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeCancelTpsl(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/cancel-tpsl"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeCancelAlgo(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/cancel-algo"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeClosePosition(self::Blofin, params=Dict(), context=Dict())
    return request(self, "trade/close-position"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingAccountSetPositionMode(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/account/set-position-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingAccountSetLeverage(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/account/set-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingTradePlaceOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/place-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingTradeCancelOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/cancel-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingTradePlaceTpslByContract(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/place-tpsl-by-contract"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingTradeCancelTpslByContract(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/cancel-tpsl-by-contract"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingTradePlaceTpslByOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/place-tpsl-by-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingTradeCancelTpslByOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/cancel-tpsl-by-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingTradeClosePositionByOrder(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/close-position-by-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCopytradingTradeClosePositionByContract(self::Blofin, params=Dict(), context=Dict())
    return request(self, "copytrading/trade/close-position-by-contract"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Blofin(; kwargs...)
    inst = Blofin(Exchange(), describe, fetchMarkets, parseMarket, fetchOrderBook, parseTicker, fetchTicker, fetchMarkPrice, fetchTickers, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, fetchFundingRateHistory, parseFundingRate, fetchFundingRate, parseBalanceByType, parseBalance, parseFundingBalance, parseTradingFee, fetchBalance, createOrderRequest, parseOrderStatus, parseOrder, createOrder, createTpslOrderRequest, cancelOrder, createOrders, fetchOpenOrders, fetchMyTrades, fetchDeposits, fetchWithdrawals, fetchLedger, parseTransaction, parseTransactionWithdrawalStatus, parseTransactionDepositStatus, parseLedgerEntryType, parseLedgerEntry, parseIds, cancelOrders, transfer, parseTransfer, fetchPosition, fetchPositions, fetchPositionsHistory, parsePosition, fetchLeverages, fetchLeverage, parseLeverage, setLeverage, closePosition, fetchClosedOrders, fetchMarginMode, parseMarginMode, setMarginMode, fetchPositionMode, setPositionMode, fetchPositionsADLRank, parseADLRank, handleErrors, sign, publicGetMarketInstruments, publicGetMarketTickers, publicGetMarketBooks, publicGetMarketTrades, publicGetMarketMarkPrice, publicGetMarketFundingRate, publicGetMarketFundingRateHistory, publicGetMarketCandles, publicGetMarketIndexCandles, publicGetMarketMarkPriceCandles, publicGetMarketPositionTiers, privateGetAssetBalances, privateGetAssetBills, privateGetAssetWithdrawalHistory, privateGetAssetDepositHistory, privateGetAccountConfig, privateGetAssetCurrencies, privateGetAccountBalance, privateGetAccountPositions, privateGetAccountPositionsHistory, privateGetAccountMarginMode, privateGetAccountPositionMode, privateGetAccountLeverageInfo, privateGetAccountBatchLeverageInfo, privateGetTradeOrdersPending, privateGetTradeOrderDetail, privateGetTradeOrdersTpslPending, privateGetTradeOrderTpslDetail, privateGetTradeOrdersAlgoPending, privateGetTradeOrdersHistory, privateGetTradeOrdersTpslHistory, privateGetTradeOrdersAlgoHistory, privateGetTradeFillsHistory, privateGetTradeOrderPriceRange, privateGetAffiliateBasic, privateGetAffiliateReferralCode, privateGetAffiliateInvitees, privateGetAffiliateSubInvitees, privateGetAffiliateSubAffiliates, privateGetAffiliateInviteesDailyInfo, privateGetCopytradingInstruments, privateGetCopytradingConfig, privateGetCopytradingAccountBalance, privateGetCopytradingAccountPositionsByOrder, privateGetCopytradingAccountPositionsDetailsByOrder, privateGetCopytradingAccountPositionsByContract, privateGetCopytradingAccountPositionMode, privateGetCopytradingAccountLeverageInfo, privateGetCopytradingTradeOrdersPending, privateGetCopytradingTradePendingTpslByContract, privateGetCopytradingTradePositionHistoryByOrder, privateGetCopytradingTradeOrdersHistory, privateGetCopytradingTradePendingTpslByOrder, privateGetUserQueryApikey, privateGetSpotTradeFillsHistory, privatePostAssetTransfer, privatePostAssetDemoApplyMoney, privatePostAccountSetMarginMode, privatePostAccountSetPositionMode, privatePostAccountSetLeverage, privatePostTradeOrder, privatePostTradeBatchOrders, privatePostTradeOrderTpsl, privatePostTradeOrderAlgo, privatePostTradeCancelOrder, privatePostTradeCancelBatchOrders, privatePostTradeCancelTpsl, privatePostTradeCancelAlgo, privatePostTradeClosePosition, privatePostCopytradingAccountSetPositionMode, privatePostCopytradingAccountSetLeverage, privatePostCopytradingTradePlaceOrder, privatePostCopytradingTradeCancelOrder, privatePostCopytradingTradePlaceTpslByContract, privatePostCopytradingTradeCancelTpslByContract, privatePostCopytradingTradePlaceTpslByOrder, privatePostCopytradingTradeCancelTpslByOrder, privatePostCopytradingTradeClosePositionByOrder, privatePostCopytradingTradeClosePositionByContract)
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
function __ccxt_doc_Blofin_fetchMarkets() end
"""
retrieves data on all markets for blofin
see: https://blofin.com/docs#get-instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Blofin_fetchMarkets

function __ccxt_doc_Blofin_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://blofin.com/docs#get-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Blofin_fetchOrderBook

function __ccxt_doc_Blofin_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://blofin.com/docs#get-tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Blofin_fetchTicker

function __ccxt_doc_Blofin_fetchMarkPrice() end
"""
fetches mark price for the market
see: https://docs.blofin.com/index.html#get-mark-price

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Blofin_fetchMarkPrice

function __ccxt_doc_Blofin_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://blofin.com/docs#get-tickers

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Blofin_fetchTickers

function __ccxt_doc_Blofin_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://blofin.com/docs#get-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: *only applies to publicGetMarketHistoryTrades* default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Blofin_fetchTrades

function __ccxt_doc_Blofin_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://blofin.com/docs#get-candlesticks

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
__ccxt_doc_Blofin_fetchOHLCV

function __ccxt_doc_Blofin_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://blofin.com/docs#get-funding-rate-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: timestamp in ms of the latest funding rate to fetch

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Blofin_fetchFundingRateHistory

function __ccxt_doc_Blofin_fetchFundingRate() end
"""
fetch the current funding rate
see: https://blofin.com/docs#get-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Blofin_fetchFundingRate

function __ccxt_doc_Blofin_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://blofin.com/docs#get-balance
see: https://blofin.com/docs#get-futures-account-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: the type of account to fetch the balance for, either 'funding' or 'futures'  or 'copy_trading' or 'earn'

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Blofin_fetchBalance

function __ccxt_doc_Blofin_createOrder() end
"""
create a trade order
see: https://blofin.com/docs#place-order
see: https://blofin.com/docs#place-tpsl-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'post_only' or 'ioc' or 'fok'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::string, optional: the trigger price for a trigger order
- `params.reduceOnly`::bool, optional: a mark to reduce the position size for margin, swap and future orders
- `params.postOnly`::bool, optional: true to place a post only order
- `params.marginMode`::string, optional: 'cross' or 'isolated', default is 'cross'
- `params.stopLossPrice`::float, optional: stop loss trigger price (will use privatePostTradeOrderTpsl)
- `params.takeProfitPrice`::float, optional: take profit trigger price (will use privatePostTradeOrderTpsl)
- `params.positionSide`::string, optional: *stopLossPrice/takeProfitPrice orders only* 'long' or 'short' or 'net' default is 'net'
- `params.hedged`::bool, optional: if true, the positionSide will be set to long/short instead of net, default is false
- `params.clientOrderId`::string, optional: a unique id for the order
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.takeProfit.price`::float, optional: take profit order price (if not provided the order will be a market order)
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.stopLoss.price`::float, optional: stop loss order price (if not provided the order will be a market order)
- `params.tpsl`::float, optional: whether to force to send the order to the combined TPSL oco order endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blofin_createOrder

function __ccxt_doc_Blofin_cancelOrder() end
"""
cancels an open order
see: https://blofin.com/docs#cancel-order
see: https://blofin.com/docs#cancel-tpsl-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: True if cancelling a trigger/conditional
- `params.tpsl`::bool, optional: True if cancelling a tpsl order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blofin_cancelOrder

function __ccxt_doc_Blofin_createOrders() end
"""
create a list of trade orders
see: https://blofin.com/docs#place-multiple-orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blofin_createOrders

function __ccxt_doc_Blofin_fetchOpenOrders() end
"""
Fetch orders that are still open
see: https://blofin.com/docs#get-active-orders
see: https://blofin.com/docs#get-active-tpsl-orders
see: https://docs.blofin.com/index.html#get-active-algo-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: True if fetching trigger or conditional orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blofin_fetchOpenOrders

function __ccxt_doc_Blofin_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://blofin.com/docs#get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: Timestamp in ms of the latest time to retrieve trades for
- `params.type`::string, optional: 'swap' or 'spot' (defaults to 'swap'), required to fetch spot trade history
- `params.instId`::string, optional: *spot markets only* the market id of the spot market to fetch the trade history for (e.g. 'BTC-USDT')
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Blofin_fetchMyTrades

function __ccxt_doc_Blofin_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://blofin.com/docs#get-deposite-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Blofin_fetchDeposits

function __ccxt_doc_Blofin_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://blofin.com/docs#get-withdraw-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Blofin_fetchWithdrawals

function __ccxt_doc_Blofin_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://blofin.com/docs#get-funds-transfer-history

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Blofin_fetchLedger

function __ccxt_doc_Blofin_cancelOrders() end
"""
cancel multiple orders
see: https://blofin.com/docs#cancel-multiple-orders

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: whether the order is a stop/trigger order

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blofin_cancelOrders

function __ccxt_doc_Blofin_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://blofin.com/docs#funds-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from (funding, swap, copy_trading, earn)
- `toAccount`::string: account to transfer to (funding, swap, copy_trading, earn)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Blofin_transfer

function __ccxt_doc_Blofin_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://blofin.com/docs#get-positions

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.instType`::string, optional: MARGIN, SWAP, FUTURES, OPTION

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Blofin_fetchPosition

function __ccxt_doc_Blofin_fetchPositions() end
"""
fetch data on a single open contract trade position
see: https://blofin.com/docs#get-positions

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.instType`::string, optional: MARGIN, SWAP, FUTURES, OPTION

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Blofin_fetchPositions

function __ccxt_doc_Blofin_fetchPositionsHistory() end
"""
fetches historical positions
see: https://docs.blofin.com/index.html#get-positions-history

# Arguments
- `symbols`::array, optional: unified contract symbols
- `since`::int, optional: timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months
- `limit`::int, optional: the maximum amount of records to fetch, default=20, max=100
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months
- `params.productType`::string, optional: USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Blofin_fetchPositionsHistory

function __ccxt_doc_Blofin_fetchLeverages() end
"""
fetch the set leverage for all contract markets
see: https://docs.blofin.com/index.html#get-multiple-leverage

# Arguments
- `symbols`::array: a list of unified market symbols, required on blofin
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Blofin_fetchLeverages

function __ccxt_doc_Blofin_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://docs.blofin.com/index.html#get-leverage

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Blofin_fetchLeverage

function __ccxt_doc_Blofin_setLeverage() end
"""
set the level of leverage for a market
see: https://blofin.com/docs#set-leverage

# Arguments
- `leverage`::int: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated'
- `params.positionSide`::string, optional: 'long' or 'short' - required for hedged mode in isolated margin

# Returns
- response from the exchange
"""
__ccxt_doc_Blofin_setLeverage

function __ccxt_doc_Blofin_closePosition() end
"""
closes open positions for a market
see: https://blofin.com/docs#close-positions

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: 'buy' or 'sell', leave as undefined in net mode
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique identifier for the order
- `params.marginMode`::string, optional: 'cross' or 'isolated', default is 'cross;
- `params.code`::string, optional: *required in the case of closing cross MARGIN position for Single-currency margin* margin currency EXCHANGE SPECIFIC PARAMETERS
- `params.autoCxl`::bool, optional: whether any pending orders for closing out needs to be automatically canceled when close position via a market order. false or true, the default is false
- `params.tag`::string, optional: order tag a combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters

# Returns
- [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Blofin_closePosition

function __ccxt_doc_Blofin_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://blofin.com/docs#get-order-history
see: https://blofin.com/docs#get-tpsl-order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of  orde structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: True if fetching trigger or conditional orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Blofin_fetchClosedOrders

function __ccxt_doc_Blofin_fetchMarginMode() end
"""
fetches the margin mode of a trading pair
see: https://docs.blofin.com/index.html#get-margin-mode

# Arguments
- `symbol`::string: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Blofin_fetchMarginMode

function __ccxt_doc_Blofin_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://docs.blofin.com/index.html#set-margin-mode

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string, optional: unified market symbol (not used in blofin setMarginMode)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Blofin_setMarginMode

function __ccxt_doc_Blofin_fetchPositionMode() end
"""
fetchs the position mode, hedged or one way
see: https://docs.blofin.com/index.html#get-position-mode

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the position mode for (not used in blofin fetchPositionMode)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
__ccxt_doc_Blofin_fetchPositionMode

function __ccxt_doc_Blofin_setPositionMode() end
"""
set hedged to true or false for a market
see: https://docs.blofin.com/index.html#set-position-mode

# Arguments
- `hedged`::bool: set to true to use hedged mode, false for one-way mode
- `symbol`::string, optional: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Blofin_setPositionMode

function __ccxt_doc_Blofin_fetchPositionsADLRank() end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols
see: https://docs.blofin.com/index.html#get-positions

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [auto de leverage structures]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
__ccxt_doc_Blofin_fetchPositionsADLRank
