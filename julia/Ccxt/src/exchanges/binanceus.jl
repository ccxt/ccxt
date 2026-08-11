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
                Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("aggTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[100, 1], [500, 5], [1000, 10], [5000, 50]]
),
                Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 2
),
                Symbol("avgPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
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
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("rateLimit/order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3,
    Symbol("noSymbol") => 40
),
                Symbol("myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("myPreventedMatches") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("allOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("openOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 3
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/cancelReplace") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/oco") => Dict{Symbol, Any}(
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
                Symbol("orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("sapi") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("system/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/assetDistributionHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/query/trading-fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/query/trading-volume") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/spotSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("otc/coinPairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("otc/orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("otc/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ocbs/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/config/getall") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fiatpayment/query/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/deposit/hisrec") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fiatpayment/query/deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/sub-account/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/sub-account/deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/query/dust-logs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/query/dust-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("marketing/referral/reward/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("staking/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("staking/stakingBalance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("staking/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("staking/stakingRewardsHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/supportedAssetList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/walletTransferHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/custodianTransferHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/orderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/tradeHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/settlementSetting") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/settlementHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cl/transferHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apipartner/checkEligibility") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apipartner/rebateHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("otc/quotes") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("otc/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fiatpayment/withdraw/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/withdraw/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/dust") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("staking/stake") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("staking/unstake") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/walletTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/custodianTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/undoTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/ocoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cl/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("custodian/cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/cancelOrdersBySymbol") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("custodian/cancelOcoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("sapiV2") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("cl/account") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("cl/alertHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("sapiV3") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("accountStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiTradingStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("sub-account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Binanceus, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetPing(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ping", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTime(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "time", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetExchangeInfo(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "exchangeInfo", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTrades(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetHistoricalTrades(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "historicalTrades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAggTrades(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "aggTrades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetDepth(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "depth", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetKlines(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "klines", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickerPrice(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ticker/price", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAvgPrice(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "avgPrice", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickerBookTicker(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ticker/bookTicker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker24hr(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ticker/24hr", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetAccount(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRateLimitOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "rateLimit/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "openOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMyTrades(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "myTrades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetMyPreventedMatches(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "myPreventedMatches", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAllOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "allOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrderList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "orderList", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAllOrderList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "allOrderList", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenOrderList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "openOrderList", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderTest(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order/test", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderCancelReplace(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order/cancelReplace", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderOco(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order/oco", "private", "POST", params, nothing, nothing, Dict())
end

function privateDeleteOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteOpenOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "openOrders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteOrderList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "orderList", "private", "DELETE", params, nothing, nothing, Dict())
end

function sapiGetSystemStatus(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "system/status", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetAssetAssetDistributionHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/assetDistributionHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetAssetQueryTradingFee(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/query/trading-fee", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetAssetQueryTradingVolume(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/query/trading-volume", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetSubAccountSpotSummary(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/spotSummary", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetSubAccountStatus(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/status", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetOtcCoinPairs(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/coinPairs", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetOtcOrdersOrderId(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/orders/{orderId}", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetOtcOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/orders", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetOcbsOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "ocbs/orders", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCapitalConfigGetall(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/config/getall", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCapitalWithdrawHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/history", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetFiatpaymentQueryWithdrawHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "fiatpayment/query/withdraw/history", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCapitalDepositAddress(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/deposit/address", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCapitalDepositHisrec(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/deposit/hisrec", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetFiatpaymentQueryDepositHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "fiatpayment/query/deposit/history", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCapitalSubAccountDepositAddress(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/sub-account/deposit/address", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCapitalSubAccountDepositHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/sub-account/deposit/history", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetAssetQueryDustLogs(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/query/dust-logs", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetAssetQueryDustAssets(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/query/dust-assets", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetMarketingReferralRewardHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "marketing/referral/reward/history", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetStakingAsset(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/asset", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetStakingStakingBalance(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/stakingBalance", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetStakingHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/history", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetStakingStakingRewardsHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/stakingRewardsHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianBalance(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/balance", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianSupportedAssetList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/supportedAssetList", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianWalletTransferHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/walletTransferHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianCustodianTransferHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/custodianTransferHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianOpenOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/openOrders", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/order", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianOrderHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/orderHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianTradeHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/tradeHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianSettlementSetting(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/settlementSetting", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetCustodianSettlementHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/settlementHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetClTransferHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "cl/transferHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetApipartnerCheckEligibility(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "apipartner/checkEligibility", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiGetApipartnerRebateHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "apipartner/rebateHistory", "sapi", "GET", params, nothing, nothing, Dict())
end

function sapiPostOtcQuotes(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/quotes", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostOtcOrders(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "otc/orders", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostFiatpaymentWithdrawApply(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "fiatpayment/withdraw/apply", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostCapitalWithdrawApply(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/apply", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostAssetDust(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "asset/dust", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostStakingStake(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/stake", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostStakingUnstake(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "staking/unstake", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostCustodianWalletTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/walletTransfer", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostCustodianCustodianTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/custodianTransfer", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostCustodianUndoTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/undoTransfer", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostCustodianOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/order", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostCustodianOcoOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/ocoOrder", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiPostClTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "cl/transfer", "sapi", "POST", params, nothing, nothing, Dict())
end

function sapiDeleteCustodianCancelOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/cancelOrder", "sapi", "DELETE", params, nothing, nothing, Dict())
end

function sapiDeleteCustodianCancelOrdersBySymbol(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/cancelOrdersBySymbol", "sapi", "DELETE", params, nothing, nothing, Dict())
end

function sapiDeleteCustodianCancelOcoOrder(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "custodian/cancelOcoOrder", "sapi", "DELETE", params, nothing, nothing, Dict())
end

function sapiV2GetClAccount(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "cl/account", "sapiV2", "GET", params, nothing, nothing, Dict())
end

function sapiV2GetClAlertHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "cl/alertHistory", "sapiV2", "GET", params, nothing, nothing, Dict())
end

function sapiV3GetAccountStatus(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "accountStatus", "sapiV3", "GET", params, nothing, nothing, Dict())
end

function sapiV3GetApiTradingStatus(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "apiTradingStatus", "sapiV3", "GET", params, nothing, nothing, Dict())
end

function sapiV3GetSubAccountList(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/list", "sapiV3", "GET", params, nothing, nothing, Dict())
end

function sapiV3GetSubAccountTransferHistory(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/transfer/history", "sapiV3", "GET", params, nothing, nothing, Dict())
end

function sapiV3GetSubAccountAssets(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/assets", "sapiV3", "GET", params, nothing, nothing, Dict())
end

function sapiV3PostSubAccountTransfer(self::Binanceus, params=Dict(), context=Dict())
    return request(self, "sub-account/transfer", "sapiV3", "POST", params, nothing, nothing, Dict())
end

function Binanceus(; kwargs...)
    inst = Binanceus(Binance(), describe, publicGetPing, publicGetTime, publicGetExchangeInfo, publicGetTrades, publicGetHistoricalTrades, publicGetAggTrades, publicGetDepth, publicGetKlines, publicGetTickerPrice, publicGetAvgPrice, publicGetTickerBookTicker, publicGetTicker24hr, publicGetTicker, privateGetAccount, privateGetRateLimitOrder, privateGetOrder, privateGetOpenOrders, privateGetMyTrades, privateGetMyPreventedMatches, privateGetAllOrders, privateGetOrderList, privateGetAllOrderList, privateGetOpenOrderList, privatePostOrder, privatePostOrderTest, privatePostOrderCancelReplace, privatePostOrderOco, privateDeleteOrder, privateDeleteOpenOrders, privateDeleteOrderList, sapiGetSystemStatus, sapiGetAssetAssetDistributionHistory, sapiGetAssetQueryTradingFee, sapiGetAssetQueryTradingVolume, sapiGetSubAccountSpotSummary, sapiGetSubAccountStatus, sapiGetOtcCoinPairs, sapiGetOtcOrdersOrderId, sapiGetOtcOrders, sapiGetOcbsOrders, sapiGetCapitalConfigGetall, sapiGetCapitalWithdrawHistory, sapiGetFiatpaymentQueryWithdrawHistory, sapiGetCapitalDepositAddress, sapiGetCapitalDepositHisrec, sapiGetFiatpaymentQueryDepositHistory, sapiGetCapitalSubAccountDepositAddress, sapiGetCapitalSubAccountDepositHistory, sapiGetAssetQueryDustLogs, sapiGetAssetQueryDustAssets, sapiGetMarketingReferralRewardHistory, sapiGetStakingAsset, sapiGetStakingStakingBalance, sapiGetStakingHistory, sapiGetStakingStakingRewardsHistory, sapiGetCustodianBalance, sapiGetCustodianSupportedAssetList, sapiGetCustodianWalletTransferHistory, sapiGetCustodianCustodianTransferHistory, sapiGetCustodianOpenOrders, sapiGetCustodianOrder, sapiGetCustodianOrderHistory, sapiGetCustodianTradeHistory, sapiGetCustodianSettlementSetting, sapiGetCustodianSettlementHistory, sapiGetClTransferHistory, sapiGetApipartnerCheckEligibility, sapiGetApipartnerRebateHistory, sapiPostOtcQuotes, sapiPostOtcOrders, sapiPostFiatpaymentWithdrawApply, sapiPostCapitalWithdrawApply, sapiPostAssetDust, sapiPostStakingStake, sapiPostStakingUnstake, sapiPostCustodianWalletTransfer, sapiPostCustodianCustodianTransfer, sapiPostCustodianUndoTransfer, sapiPostCustodianOrder, sapiPostCustodianOcoOrder, sapiPostClTransfer, sapiDeleteCustodianCancelOrder, sapiDeleteCustodianCancelOrdersBySymbol, sapiDeleteCustodianCancelOcoOrder, sapiV2GetClAccount, sapiV2GetClAlertHistory, sapiV3GetAccountStatus, sapiV3GetApiTradingStatus, sapiV3GetSubAccountList, sapiV3GetSubAccountTransferHistory, sapiV3GetSubAccountAssets, sapiV3PostSubAccountTransfer)
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
