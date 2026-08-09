@kwdef mutable struct Binanceus <: CcxtExchange
    parent::Union{Binance, Nothing} = Binance()
    describe::Function = describe

# Generated REST endpoint fields
    publicGetPing::Function = publicGetPing
    publicGetTime::Function = publicGetTime
    publicGetExchangeInfo::Function = publicGetExchangeInfo
    publicGetTrades::Function = publicGetTrades
    publicGetHistoricalTrades::Function = publicGetHistoricalTrades
    publicGetAggTrades::Function = publicGetAggTrades
    publicGetDepth::Function = publicGetDepth
    publicGetKlines::Function = publicGetKlines
    publicGetTickerPrice::Function = publicGetTickerPrice
    publicGetAvgPrice::Function = publicGetAvgPrice
    publicGetTickerBookTicker::Function = publicGetTickerBookTicker
    publicGetTicker24hr::Function = publicGetTicker24hr
    publicGetTicker::Function = publicGetTicker
    privateGetAccount::Function = privateGetAccount
    privateGetRateLimitOrder::Function = privateGetRateLimitOrder
    privateGetOrder::Function = privateGetOrder
    privateGetOpenOrders::Function = privateGetOpenOrders
    privateGetMyTrades::Function = privateGetMyTrades
    privateGetMyPreventedMatches::Function = privateGetMyPreventedMatches
    privateGetAllOrders::Function = privateGetAllOrders
    privateGetOrderList::Function = privateGetOrderList
    privateGetAllOrderList::Function = privateGetAllOrderList
    privateGetOpenOrderList::Function = privateGetOpenOrderList
    privatePostOrder::Function = privatePostOrder
    privatePostOrderTest::Function = privatePostOrderTest
    privatePostOrderCancelReplace::Function = privatePostOrderCancelReplace
    privatePostOrderOco::Function = privatePostOrderOco
    privateDeleteOrder::Function = privateDeleteOrder
    privateDeleteOpenOrders::Function = privateDeleteOpenOrders
    privateDeleteOrderList::Function = privateDeleteOrderList
    sapiGetSystemStatus::Function = sapiGetSystemStatus
    sapiGetAssetAssetDistributionHistory::Function = sapiGetAssetAssetDistributionHistory
    sapiGetAssetQueryTradingFee::Function = sapiGetAssetQueryTradingFee
    sapiGetAssetQueryTradingVolume::Function = sapiGetAssetQueryTradingVolume
    sapiGetSubAccountSpotSummary::Function = sapiGetSubAccountSpotSummary
    sapiGetSubAccountStatus::Function = sapiGetSubAccountStatus
    sapiGetOtcCoinPairs::Function = sapiGetOtcCoinPairs
    sapiGetOtcOrdersOrderId::Function = sapiGetOtcOrdersOrderId
    sapiGetOtcOrders::Function = sapiGetOtcOrders
    sapiGetOcbsOrders::Function = sapiGetOcbsOrders
    sapiGetCapitalConfigGetall::Function = sapiGetCapitalConfigGetall
    sapiGetCapitalWithdrawHistory::Function = sapiGetCapitalWithdrawHistory
    sapiGetFiatpaymentQueryWithdrawHistory::Function = sapiGetFiatpaymentQueryWithdrawHistory
    sapiGetCapitalDepositAddress::Function = sapiGetCapitalDepositAddress
    sapiGetCapitalDepositHisrec::Function = sapiGetCapitalDepositHisrec
    sapiGetFiatpaymentQueryDepositHistory::Function = sapiGetFiatpaymentQueryDepositHistory
    sapiGetCapitalSubAccountDepositAddress::Function = sapiGetCapitalSubAccountDepositAddress
    sapiGetCapitalSubAccountDepositHistory::Function = sapiGetCapitalSubAccountDepositHistory
    sapiGetAssetQueryDustLogs::Function = sapiGetAssetQueryDustLogs
    sapiGetAssetQueryDustAssets::Function = sapiGetAssetQueryDustAssets
    sapiGetMarketingReferralRewardHistory::Function = sapiGetMarketingReferralRewardHistory
    sapiGetStakingAsset::Function = sapiGetStakingAsset
    sapiGetStakingStakingBalance::Function = sapiGetStakingStakingBalance
    sapiGetStakingHistory::Function = sapiGetStakingHistory
    sapiGetStakingStakingRewardsHistory::Function = sapiGetStakingStakingRewardsHistory
    sapiGetCustodianBalance::Function = sapiGetCustodianBalance
    sapiGetCustodianSupportedAssetList::Function = sapiGetCustodianSupportedAssetList
    sapiGetCustodianWalletTransferHistory::Function = sapiGetCustodianWalletTransferHistory
    sapiGetCustodianCustodianTransferHistory::Function = sapiGetCustodianCustodianTransferHistory
    sapiGetCustodianOpenOrders::Function = sapiGetCustodianOpenOrders
    sapiGetCustodianOrder::Function = sapiGetCustodianOrder
    sapiGetCustodianOrderHistory::Function = sapiGetCustodianOrderHistory
    sapiGetCustodianTradeHistory::Function = sapiGetCustodianTradeHistory
    sapiGetCustodianSettlementSetting::Function = sapiGetCustodianSettlementSetting
    sapiGetCustodianSettlementHistory::Function = sapiGetCustodianSettlementHistory
    sapiGetClTransferHistory::Function = sapiGetClTransferHistory
    sapiGetApipartnerCheckEligibility::Function = sapiGetApipartnerCheckEligibility
    sapiGetApipartnerRebateHistory::Function = sapiGetApipartnerRebateHistory
    sapiPostOtcQuotes::Function = sapiPostOtcQuotes
    sapiPostOtcOrders::Function = sapiPostOtcOrders
    sapiPostFiatpaymentWithdrawApply::Function = sapiPostFiatpaymentWithdrawApply
    sapiPostCapitalWithdrawApply::Function = sapiPostCapitalWithdrawApply
    sapiPostAssetDust::Function = sapiPostAssetDust
    sapiPostStakingStake::Function = sapiPostStakingStake
    sapiPostStakingUnstake::Function = sapiPostStakingUnstake
    sapiPostCustodianWalletTransfer::Function = sapiPostCustodianWalletTransfer
    sapiPostCustodianCustodianTransfer::Function = sapiPostCustodianCustodianTransfer
    sapiPostCustodianUndoTransfer::Function = sapiPostCustodianUndoTransfer
    sapiPostCustodianOrder::Function = sapiPostCustodianOrder
    sapiPostCustodianOcoOrder::Function = sapiPostCustodianOcoOrder
    sapiPostClTransfer::Function = sapiPostClTransfer
    sapiDeleteCustodianCancelOrder::Function = sapiDeleteCustodianCancelOrder
    sapiDeleteCustodianCancelOrdersBySymbol::Function = sapiDeleteCustodianCancelOrdersBySymbol
    sapiDeleteCustodianCancelOcoOrder::Function = sapiDeleteCustodianCancelOcoOrder
    sapiV2GetClAccount::Function = sapiV2GetClAccount
    sapiV2GetClAlertHistory::Function = sapiV2GetClAlertHistory
    sapiV3GetAccountStatus::Function = sapiV3GetAccountStatus
    sapiV3GetApiTradingStatus::Function = sapiV3GetApiTradingStatus
    sapiV3GetSubAccountList::Function = sapiV3GetSubAccountList
    sapiV3GetSubAccountTransferHistory::Function = sapiV3GetSubAccountTransferHistory
    sapiV3GetSubAccountAssets::Function = sapiV3GetSubAccountAssets
    sapiV3PostSubAccountTransfer::Function = sapiV3PostSubAccountTransfer

end
function describe(self::Binanceus, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "binanceus",
    Symbol("name") => "Binance US",
    Symbol("countries") => ["US"],
    Symbol("hostname") => "binance.us",
    Symbol("rateLimit") => 50,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/a9667919-b632-4d52-a832-df89f8a35e8c",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("web") => "https://www.binance.us",
            Symbol("public") => "https://api.binance.us/api/v3",
            Symbol("private") => "https://api.binance.us/api/v3",
            Symbol("sapi") => "https://api.binance.us/sapi/v1",
            Symbol("sapiV2") => "https://api.binance.us/sapi/v2",
            Symbol("sapiV3") => "https://api.binance.us/sapi/v3"
        ),
        Symbol("www") => "https://www.binance.us",
        Symbol("referral") => "https://www.binance.us/?ref=35005074",
        Symbol("doc") => "https://github.com/binance-us/binance-official-api-docs",
        Symbol("fees") => "https://www.binance.us/en/fee/schedule"
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.001"),
            Symbol("maker") => self.parseNumber("0.001")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot"]
        ),
        Symbol("defaultType") => "spot",
        Symbol("fetchMargins") => false,
        Symbol("quoteOrderQty") => false,
        Symbol("fetchCurrencies") => false
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLossOrder") => false,
        Symbol("createTakeProfitOrder") => false,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ping") => 1,
                Symbol("time") => 1,
                Symbol("exchangeInfo") => 10,
                Symbol("trades") => 1,
                Symbol("historicalTrades") => 5,
                Symbol("aggTrades") => 1,
                Symbol("depth") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("byLimit") => [[100, 1], [500, 5], [1000, 10], [5000, 50]]
                ),
                Symbol("klines") => 1,
                Symbol("ticker/price") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("noSymbol") => 2
                ),
                Symbol("avgPrice") => 1,
                Symbol("ticker/bookTicker") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("noSymbol") => 2
                ),
                Symbol("ticker/24hr") => Dict{Symbol, Any}(
                    Symbol("cost") => 1,
                    Symbol("noSymbol") => 40
                ),
                Symbol("ticker") => Dict{Symbol, Any}(
                    Symbol("cost") => 2,
                    Symbol("noSymbol") => 100
                )
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account") => 10,
                Symbol("rateLimit/order") => 20,
                Symbol("order") => 2,
                Symbol("openOrders") => Dict{Symbol, Any}(
                    Symbol("cost") => 3,
                    Symbol("noSymbol") => 40
                ),
                Symbol("myTrades") => 10,
                Symbol("myPreventedMatches") => 10,
                Symbol("allOrders") => 10,
                Symbol("orderList") => 2,
                Symbol("allOrderList") => 10,
                Symbol("openOrderList") => 3
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("order") => 1,
                Symbol("order/test") => 1,
                Symbol("order/cancelReplace") => 1,
                Symbol("order/oco") => 1
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order") => 1,
                Symbol("openOrders") => 1,
                Symbol("orderList") => 1
            )
        ),
        Symbol("sapi") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("system/status") => 1,
                Symbol("asset/assetDistributionHistory") => 1,
                Symbol("asset/query/trading-fee") => 1,
                Symbol("asset/query/trading-volume") => 1,
                Symbol("sub-account/spotSummary") => 1,
                Symbol("sub-account/status") => 1,
                Symbol("otc/coinPairs") => 1,
                Symbol("otc/orders/{orderId}") => 1,
                Symbol("otc/orders") => 1,
                Symbol("ocbs/orders") => 1,
                Symbol("capital/config/getall") => 1,
                Symbol("capital/withdraw/history") => 1,
                Symbol("fiatpayment/query/withdraw/history") => 1,
                Symbol("capital/deposit/address") => 1,
                Symbol("capital/deposit/hisrec") => 1,
                Symbol("fiatpayment/query/deposit/history") => 1,
                Symbol("capital/sub-account/deposit/address") => 1,
                Symbol("capital/sub-account/deposit/history") => 1,
                Symbol("asset/query/dust-logs") => 1,
                Symbol("asset/query/dust-assets") => 1,
                Symbol("marketing/referral/reward/history") => 1,
                Symbol("staking/asset") => 1,
                Symbol("staking/stakingBalance") => 1,
                Symbol("staking/history") => 1,
                Symbol("staking/stakingRewardsHistory") => 1,
                Symbol("custodian/balance") => 1,
                Symbol("custodian/supportedAssetList") => 1,
                Symbol("custodian/walletTransferHistory") => 1,
                Symbol("custodian/custodianTransferHistory") => 1,
                Symbol("custodian/openOrders") => 1,
                Symbol("custodian/order") => 1,
                Symbol("custodian/orderHistory") => 1,
                Symbol("custodian/tradeHistory") => 1,
                Symbol("custodian/settlementSetting") => 1,
                Symbol("custodian/settlementHistory") => 1,
                Symbol("cl/transferHistory") => 1,
                Symbol("apipartner/checkEligibility") => 1,
                Symbol("apipartner/rebateHistory") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("otc/quotes") => 1,
                Symbol("otc/orders") => 1,
                Symbol("fiatpayment/withdraw/apply") => 1,
                Symbol("capital/withdraw/apply") => 1,
                Symbol("asset/dust") => 10,
                Symbol("staking/stake") => 1,
                Symbol("staking/unstake") => 1,
                Symbol("custodian/walletTransfer") => 1,
                Symbol("custodian/custodianTransfer") => 1,
                Symbol("custodian/undoTransfer") => 1,
                Symbol("custodian/order") => 1,
                Symbol("custodian/ocoOrder") => 1,
                Symbol("cl/transfer") => 1
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("custodian/cancelOrder") => 1,
                Symbol("custodian/cancelOrdersBySymbol") => 1,
                Symbol("custodian/cancelOcoOrder") => 1
            )
        ),
        Symbol("sapiV2") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("cl/account") => 10,
                Symbol("cl/alertHistory") => 1
            )
        ),
        Symbol("sapiV3") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accountStatus") => 1,
                Symbol("apiTradingStatus") => 1,
                Symbol("sub-account/list") => 1,
                Symbol("sub-account/transfer/history") => 1,
                Symbol("sub-account/assets") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("sub-account/transfer") => 1
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Binanceus, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetPing(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ping", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTime(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "time", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetExchangeInfo(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "exchangeInfo", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function publicGetTrades(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "trades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetHistoricalTrades(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "historicalTrades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetAggTrades(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "aggTrades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDepth(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "depth", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetKlines(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "klines", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTickerPrice(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ticker/price", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1, Symbol("noSymbol") => 2))
end

function publicGetAvgPrice(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "avgPrice", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTickerBookTicker(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ticker/bookTicker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1, Symbol("noSymbol") => 2))
end

function publicGetTicker24hr(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ticker/24hr", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1, Symbol("noSymbol") => 40))
end

function publicGetTicker(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2, Symbol("noSymbol") => 100))
end

function privateGetAccount(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "account", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetRateLimitOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "rateLimit/order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function privateGetOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privateGetOpenOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "openOrders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 3, Symbol("noSymbol") => 40))
end

function privateGetMyTrades(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "myTrades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetMyPreventedMatches(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "myPreventedMatches", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetAllOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "allOrders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetOrderList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "orderList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privateGetAllOrderList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "allOrderList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetOpenOrderList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "openOrderList", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 3))
end

function privatePostOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrderTest(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order/test", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrderCancelReplace(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order/cancelReplace", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrderOco(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order/oco", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOpenOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "openOrders", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOrderList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "orderList", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetSystemStatus(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "system/status", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetAssetAssetDistributionHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/assetDistributionHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetAssetQueryTradingFee(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/query/trading-fee", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetAssetQueryTradingVolume(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/query/trading-volume", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetSubAccountSpotSummary(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/spotSummary", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetSubAccountStatus(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/status", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetOtcCoinPairs(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/coinPairs", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetOtcOrdersOrderId(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/orders/{orderId}", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetOtcOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/orders", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetOcbsOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ocbs/orders", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCapitalConfigGetall(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/config/getall", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCapitalWithdrawHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/history", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetFiatpaymentQueryWithdrawHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "fiatpayment/query/withdraw/history", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCapitalDepositAddress(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/deposit/address", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCapitalDepositHisrec(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/deposit/hisrec", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetFiatpaymentQueryDepositHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "fiatpayment/query/deposit/history", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCapitalSubAccountDepositAddress(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/sub-account/deposit/address", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCapitalSubAccountDepositHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/sub-account/deposit/history", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetAssetQueryDustLogs(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/query/dust-logs", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetAssetQueryDustAssets(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/query/dust-assets", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetMarketingReferralRewardHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "marketing/referral/reward/history", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetStakingAsset(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/asset", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetStakingStakingBalance(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/stakingBalance", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetStakingHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/history", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetStakingStakingRewardsHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/stakingRewardsHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianBalance(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/balance", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianSupportedAssetList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/supportedAssetList", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianWalletTransferHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/walletTransferHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianCustodianTransferHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/custodianTransferHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianOpenOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/openOrders", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/order", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianOrderHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/orderHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianTradeHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/tradeHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianSettlementSetting(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/settlementSetting", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetCustodianSettlementHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/settlementHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetClTransferHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "cl/transferHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetApipartnerCheckEligibility(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "apipartner/checkEligibility", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiGetApipartnerRebateHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "apipartner/rebateHistory", "sapi", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostOtcQuotes(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/quotes", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostOtcOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/orders", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostFiatpaymentWithdrawApply(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "fiatpayment/withdraw/apply", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostCapitalWithdrawApply(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/apply", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostAssetDust(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/dust", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function sapiPostStakingStake(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/stake", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostStakingUnstake(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/unstake", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostCustodianWalletTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/walletTransfer", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostCustodianCustodianTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/custodianTransfer", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostCustodianUndoTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/undoTransfer", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostCustodianOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/order", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostCustodianOcoOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/ocoOrder", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiPostClTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "cl/transfer", "sapi", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiDeleteCustodianCancelOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/cancelOrder", "sapi", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiDeleteCustodianCancelOrdersBySymbol(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/cancelOrdersBySymbol", "sapi", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiDeleteCustodianCancelOcoOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/cancelOcoOrder", "sapi", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiV2GetClAccount(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "cl/account", "sapiV2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function sapiV2GetClAlertHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "cl/alertHistory", "sapiV2", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiV3GetAccountStatus(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "accountStatus", "sapiV3", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiV3GetApiTradingStatus(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "apiTradingStatus", "sapiV3", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiV3GetSubAccountList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/list", "sapiV3", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiV3GetSubAccountTransferHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/transfer/history", "sapiV3", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiV3GetSubAccountAssets(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/assets", "sapiV3", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function sapiV3PostSubAccountTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/transfer", "sapiV3", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Binanceus(; kwargs...)
    inst = Binanceus(Binance(), describe, publicGetPing, publicGetTime, publicGetExchangeInfo, publicGetTrades, publicGetHistoricalTrades, publicGetAggTrades, publicGetDepth, publicGetKlines, publicGetTickerPrice, publicGetAvgPrice, publicGetTickerBookTicker, publicGetTicker24hr, publicGetTicker, privateGetAccount, privateGetRateLimitOrder, privateGetOrder, privateGetOpenOrders, privateGetMyTrades, privateGetMyPreventedMatches, privateGetAllOrders, privateGetOrderList, privateGetAllOrderList, privateGetOpenOrderList, privatePostOrder, privatePostOrderTest, privatePostOrderCancelReplace, privatePostOrderOco, privateDeleteOrder, privateDeleteOpenOrders, privateDeleteOrderList, sapiGetSystemStatus, sapiGetAssetAssetDistributionHistory, sapiGetAssetQueryTradingFee, sapiGetAssetQueryTradingVolume, sapiGetSubAccountSpotSummary, sapiGetSubAccountStatus, sapiGetOtcCoinPairs, sapiGetOtcOrdersOrderId, sapiGetOtcOrders, sapiGetOcbsOrders, sapiGetCapitalConfigGetall, sapiGetCapitalWithdrawHistory, sapiGetFiatpaymentQueryWithdrawHistory, sapiGetCapitalDepositAddress, sapiGetCapitalDepositHisrec, sapiGetFiatpaymentQueryDepositHistory, sapiGetCapitalSubAccountDepositAddress, sapiGetCapitalSubAccountDepositHistory, sapiGetAssetQueryDustLogs, sapiGetAssetQueryDustAssets, sapiGetMarketingReferralRewardHistory, sapiGetStakingAsset, sapiGetStakingStakingBalance, sapiGetStakingHistory, sapiGetStakingStakingRewardsHistory, sapiGetCustodianBalance, sapiGetCustodianSupportedAssetList, sapiGetCustodianWalletTransferHistory, sapiGetCustodianCustodianTransferHistory, sapiGetCustodianOpenOrders, sapiGetCustodianOrder, sapiGetCustodianOrderHistory, sapiGetCustodianTradeHistory, sapiGetCustodianSettlementSetting, sapiGetCustodianSettlementHistory, sapiGetClTransferHistory, sapiGetApipartnerCheckEligibility, sapiGetApipartnerRebateHistory, sapiPostOtcQuotes, sapiPostOtcOrders, sapiPostFiatpaymentWithdrawApply, sapiPostCapitalWithdrawApply, sapiPostAssetDust, sapiPostStakingStake, sapiPostStakingUnstake, sapiPostCustodianWalletTransfer, sapiPostCustodianCustodianTransfer, sapiPostCustodianUndoTransfer, sapiPostCustodianOrder, sapiPostCustodianOcoOrder, sapiPostClTransfer, sapiDeleteCustodianCancelOrder, sapiDeleteCustodianCancelOrdersBySymbol, sapiDeleteCustodianCancelOcoOrder, sapiV2GetClAccount, sapiV2GetClAlertHistory, sapiV3GetAccountStatus, sapiV3GetApiTradingStatus, sapiV3GetSubAccountList, sapiV3GetSubAccountTransferHistory, sapiV3GetSubAccountAssets, sapiV3PostSubAccountTransfer)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
