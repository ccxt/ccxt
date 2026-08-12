@kwdef mutable struct Coinspot <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    handleErrors::Function = handleErrors
    sign::Function = sign

# Generated REST endpoint fields
    publicGetLatest::Function = publicGetLatest
    privatePostOrders::Function = privatePostOrders
    privatePostOrdersHistory::Function = privatePostOrdersHistory
    privatePostMyCoinDeposit::Function = privatePostMyCoinDeposit
    privatePostMyCoinSend::Function = privatePostMyCoinSend
    privatePostQuoteBuy::Function = privatePostQuoteBuy
    privatePostQuoteSell::Function = privatePostQuoteSell
    privatePostMyBalances::Function = privatePostMyBalances
    privatePostMyOrders::Function = privatePostMyOrders
    privatePostMyBuy::Function = privatePostMyBuy
    privatePostMySell::Function = privatePostMySell
    privatePostMyBuyCancel::Function = privatePostMyBuyCancel
    privatePostMySellCancel::Function = privatePostMySellCancel
    privatePostRoMyBalances::Function = privatePostRoMyBalances
    privatePostRoMyBalancesCointype::Function = privatePostRoMyBalancesCointype
    privatePostRoMyDeposits::Function = privatePostRoMyDeposits
    privatePostRoMyWithdrawals::Function = privatePostRoMyWithdrawals
    privatePostRoMyTransactions::Function = privatePostRoMyTransactions
    privatePostRoMyTransactionsCointype::Function = privatePostRoMyTransactionsCointype
    privatePostRoMyTransactionsOpen::Function = privatePostRoMyTransactionsOpen
    privatePostRoMyTransactionsCointypeOpen::Function = privatePostRoMyTransactionsCointypeOpen
    privatePostRoMySendreceive::Function = privatePostRoMySendreceive
    privatePostRoMyAffiliatepayments::Function = privatePostRoMyAffiliatepayments
    privatePostRoMyReferralpayments::Function = privatePostRoMyReferralpayments
    v2PublicGetLatest::Function = v2PublicGetLatest
    v2PublicGetLatestCointype::Function = v2PublicGetLatestCointype
    v2PublicGetLatestCointypeMarkettype::Function = v2PublicGetLatestCointypeMarkettype
    v2PublicGetBuypriceCointype::Function = v2PublicGetBuypriceCointype
    v2PublicGetBuypriceCointypeMarkettype::Function = v2PublicGetBuypriceCointypeMarkettype
    v2PublicGetSellpriceCointype::Function = v2PublicGetSellpriceCointype
    v2PublicGetSellpriceCointypeMarkettype::Function = v2PublicGetSellpriceCointypeMarkettype
    v2PublicGetOrdersOpenCointype::Function = v2PublicGetOrdersOpenCointype
    v2PublicGetOrdersOpenCointypeMarkettype::Function = v2PublicGetOrdersOpenCointypeMarkettype
    v2PublicGetOrdersCompletedCointype::Function = v2PublicGetOrdersCompletedCointype
    v2PublicGetOrdersCompletedCointypeMarkettype::Function = v2PublicGetOrdersCompletedCointypeMarkettype
    v2PublicGetOrdersSummaryCompletedCointype::Function = v2PublicGetOrdersSummaryCompletedCointype
    v2PublicGetOrdersSummaryCompletedCointypeMarkettype::Function = v2PublicGetOrdersSummaryCompletedCointypeMarkettype
    v2PrivatePostStatus::Function = v2PrivatePostStatus
    v2PrivatePostMyCoinDeposit::Function = v2PrivatePostMyCoinDeposit
    v2PrivatePostQuoteBuyNow::Function = v2PrivatePostQuoteBuyNow
    v2PrivatePostQuoteSellNow::Function = v2PrivatePostQuoteSellNow
    v2PrivatePostQuoteSwapNow::Function = v2PrivatePostQuoteSwapNow
    v2PrivatePostMyBuy::Function = v2PrivatePostMyBuy
    v2PrivatePostMyBuyEdit::Function = v2PrivatePostMyBuyEdit
    v2PrivatePostMySell::Function = v2PrivatePostMySell
    v2PrivatePostMySellEdit::Function = v2PrivatePostMySellEdit
    v2PrivatePostMyBuyNow::Function = v2PrivatePostMyBuyNow
    v2PrivatePostMySellNow::Function = v2PrivatePostMySellNow
    v2PrivatePostMySwapNow::Function = v2PrivatePostMySwapNow
    v2PrivatePostMyBuyCancel::Function = v2PrivatePostMyBuyCancel
    v2PrivatePostMyBuyCancelAll::Function = v2PrivatePostMyBuyCancelAll
    v2PrivatePostMySellCancel::Function = v2PrivatePostMySellCancel
    v2PrivatePostMySellCancelAll::Function = v2PrivatePostMySellCancelAll
    v2PrivatePostMyCoinWithdrawSenddetails::Function = v2PrivatePostMyCoinWithdrawSenddetails
    v2PrivatePostMyCoinWithdrawSend::Function = v2PrivatePostMyCoinWithdrawSend
    v2PrivatePostRoStatus::Function = v2PrivatePostRoStatus
    v2PrivatePostRoOrdersMarketOpen::Function = v2PrivatePostRoOrdersMarketOpen
    v2PrivatePostRoOrdersMarketCompleted::Function = v2PrivatePostRoOrdersMarketCompleted
    v2PrivatePostRoMyBalances::Function = v2PrivatePostRoMyBalances
    v2PrivatePostRoMyBalanceCointype::Function = v2PrivatePostRoMyBalanceCointype
    v2PrivatePostRoMyOrdersMarketOpen::Function = v2PrivatePostRoMyOrdersMarketOpen
    v2PrivatePostRoMyOrdersLimitOpen::Function = v2PrivatePostRoMyOrdersLimitOpen
    v2PrivatePostRoMyOrdersCompleted::Function = v2PrivatePostRoMyOrdersCompleted
    v2PrivatePostRoMyOrdersMarketCompleted::Function = v2PrivatePostRoMyOrdersMarketCompleted
    v2PrivatePostRoMySendreceive::Function = v2PrivatePostRoMySendreceive
    v2PrivatePostRoMyDeposits::Function = v2PrivatePostRoMyDeposits
    v2PrivatePostRoMyWithdrawals::Function = v2PrivatePostRoMyWithdrawals
    v2PrivatePostRoMyAffiliatepayments::Function = v2PrivatePostRoMyAffiliatepayments
    v2PrivatePostRoMyReferralpayments::Function = v2PrivatePostRoMyReferralpayments

end
function describe(self::Coinspot, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coinspot",
    Symbol("name") => "CoinSpot",
    Symbol("countries") => ["AU"],
    Symbol("rateLimit") => 1000,
    Symbol("pro") => false,
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
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketOrder") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("fetchBalance") => true,
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
        Symbol("fetchLeverages") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarginModes") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("ws") => false
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://www.coinspot.com.au/pubapi",
            Symbol("private") => "https://www.coinspot.com.au/api"
        ),
        Symbol("www") => "https://www.coinspot.com.au",
        Symbol("doc") => "https://www.coinspot.com.au/api",
        Symbol("referral") => "https://www.coinspot.com.au/register?code=PJURCU"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("latest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my/coin/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my/coin/send") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/buy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/sell") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my/buy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my/sell") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my/buy/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my/sell/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/balances/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/transactions/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/transactions/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/transactions/{cointype}/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/sendreceive") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/affiliatepayments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ro/my/referralpayments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("latest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("latest/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("latest/{cointype}/{markettype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("buyprice/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("buyprice/{cointype}/{markettype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sellprice/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sellprice/{cointype}/{markettype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/open/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/open/{cointype}/{markettype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/completed/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/completed/{cointype}/{markettype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/summary/completed/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orders/summary/completed/{cointype}/{markettype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/coin/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("quote/buy/now") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("quote/sell/now") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("quote/swap/now") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/buy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/buy/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/sell") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/sell/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/buy/now") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/sell/now") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/swap/now") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/buy/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/buy/cancel/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/sell/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/sell/cancel/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/coin/withdraw/senddetails") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("my/coin/withdraw/send") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/orders/market/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/orders/market/completed") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/balance/{cointype}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/orders/market/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/orders/limit/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/orders/completed") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/orders/market/completed") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/sendreceive") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/affiliatepayments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ro/my/referralpayments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("markets") => Dict{Symbol, Any}(
        Symbol("BTC/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "btc",
    Symbol("symbol") => "BTC/AUD",
    Symbol("base") => "BTC",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "btc",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("BTC/USDT") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "btc",
    Symbol("symbol") => "BTC/USDT",
    Symbol("base") => "BTC",
    Symbol("quote") => "USDT",
    Symbol("baseId") => "btc",
    Symbol("quoteId") => "usdt",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("USDT/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "usdt",
    Symbol("symbol") => "USDT/AUD",
    Symbol("base") => "USDT",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "usdt",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("ETH/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "eth",
    Symbol("symbol") => "ETH/AUD",
    Symbol("base") => "ETH",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "eth",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("ADA/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "ada",
    Symbol("symbol") => "ADA/AUD",
    Symbol("base") => "ADA",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "ada",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("SOL/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "sol",
    Symbol("symbol") => "SOL/AUD",
    Symbol("base") => "SOL",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "sol",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("XRP/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "xrp",
    Symbol("symbol") => "XRP/AUD",
    Symbol("base") => "XRP",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "xrp",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("DOGE/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "doge",
    Symbol("symbol") => "DOGE/AUD",
    Symbol("base") => "DOGE",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "doge",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("LTC/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "ltc",
    Symbol("symbol") => "LTC/AUD",
    Symbol("base") => "LTC",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "ltc",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("XLM/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "xlm",
    Symbol("symbol") => "XLM/AUD",
    Symbol("base") => "XLM",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "xlm",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("TRX/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "trx",
    Symbol("symbol") => "TRX/AUD",
    Symbol("base") => "TRX",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "trx",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("EOS/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "eos",
    Symbol("symbol") => "EOS/AUD",
    Symbol("base") => "EOS",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "eos",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("A/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "eos",
    Symbol("symbol") => "A/AUD",
    Symbol("base") => "A",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "eos",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("NEO/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "neo",
    Symbol("symbol") => "NEO/AUD",
    Symbol("base") => "NEO",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "ans",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("POWR/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "powr",
    Symbol("symbol") => "POWR/AUD",
    Symbol("base") => "POWR",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "powr",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("GAS/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "gas",
    Symbol("symbol") => "GAS/AUD",
    Symbol("base") => "GAS",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "gas",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
)),
        Symbol("RHOC/AUD") => self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => "rhoc",
    Symbol("symbol") => "RHOC/AUD",
    Symbol("base") => "RHOC",
    Symbol("quote") => "AUD",
    Symbol("baseId") => "rhoc",
    Symbol("quoteId") => "aud",
    Symbol("type") => "spot",
    Symbol("spot") => true
))
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("DRK") => "DASH"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchBalance") => "private_post_my_balances"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
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
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => nothing,
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => nothing
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
function parseBalance(self::Coinspot, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = safeValue2(response, "balance", "balances");
    if functions.ccxtruthy(functions.ccxt_isArray(balances))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
            currencies = get(balances, i + 1, nothing);
            currencyIds = objectKeys(currencies);
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(currencyIds)))
                currencyId = get(currencyIds, j + 1, nothing);
                balance = get(currencies, Symbol(currencyId), nothing);
                code = self.safeCurrencyCode(currencyId);
                account = self.account();
                account[Symbol("total")] = safeString(balance, "balance");
                if functions.ccxtruthy(code != nothing)
                    result[Symbol(code)] = account;
                end
                j += 1
            end
            i += 1
        end

    else
        currencyIds = objectKeys(balances);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
            currencyId = get(currencyIds, i + 1, nothing);
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("total")] = safeString(balances, currencyId);
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.coinspot.com.au/api#listmybalance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Coinspot; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    method = safeString(self.options, "fetchBalance", "private_post_my_balances");
    response = Base.fetch(getproperty(self, Symbol(method))(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.coinspot.com.au/api#listopenorders

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Coinspot, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("cointype") => get(market, Symbol("id"), nothing)
    );
    orderbook = Base.fetch(self.privatePostOrders(extend(request, params)));
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "buyorders", asksKey = "sellorders", priceKey = "rate", amountKey = "amount")

end
function parseTicker(self::Coinspot, ticker; market=nothing)
    symbol = self.safeSymbol(nothing, market = market);
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.coinspot.com.au/api#latestprices

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Coinspot, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = Base.fetch(self.publicGetLatest(params));
    id = safeString(market, "id", "");
    id = lowercase(id);
    prices = self.safeDict(response, "prices", defaultValue = Dict{Symbol, Any}());
    ticker = self.safeDict(prices, id, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(ticker, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.coinspot.com.au/api#latestprices

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Coinspot; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetLatest(params));
    result = Dict{Symbol, Any}();
    prices = self.safeDict(response, "prices", defaultValue = Dict{Symbol, Any}());
    ids = objectKeys(prices);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        market = self.safeMarket(marketId = id);
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            symbol = get(market, Symbol("symbol"), nothing);
            ticker = get(prices, Symbol(id), nothing);
            result[Symbol(symbol)] = self.parseTicker(ticker, market = market);
        end
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
"""
get the list of most recent trades for a particular symbol
see: https://www.coinspot.com.au/api#orderhistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Coinspot, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("cointype") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostOrdersHistory(extend(request, params)));
    trades = self.safeList(response, "orders", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://www.coinspot.com.au/api#rotransaction

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Coinspot; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startdate")] = self.yyyymmdd(since);
    end
    response = Base.fetch(self.privatePostRoMyTransactions(extend(request, params)));
    buyTrades = self.safeList(response, "buyorders", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(buyTrades)))
        buyTrades[i + 1][Symbol("side")] = "buy";
        i += 1
    end
    sellTrades = self.safeList(response, "sellorders", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(sellTrades)))
        sellTrades[i + 1][Symbol("side")] = "sell";
        i += 1
    end
    trades = arrayConcat(buyTrades, sellTrades);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTrade(self::Coinspot, trade; market=nothing)
    timestamp = nothing;
    priceString = nothing;
    fee = nothing;
    audTotal = safeString(trade, "audtotal");
    costString = safeString(trade, "total", audTotal);
    side = safeString(trade, "side");
    amountString = safeString(trade, "amount");
    marketId = safeString(trade, "market");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "/");
    solddate = safeInteger(trade, "solddate");
    if functions.ccxtruthy(solddate != nothing)
        priceString = safeString(trade, "rate");
        timestamp = solddate;
    else
        priceString = stringDiv(costString, amountString);
        createdString = safeString(trade, "created");
        timestamp = self.parse8601(createdString);
        audfeeExGst = safeString(trade, "audfeeExGst");
        audGst = safeString(trade, "audGst");
        feeCost = stringAdd(audfeeExGst, audGst);
        feeCurrencyId = "AUD";
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCost),
            Symbol("currency") => self.safeCurrencyCode(feeCurrencyId)
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("order") => nothing,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => self.parseNumber(priceString),
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("cost") => self.parseNumber(costString),
    Symbol("fee") => fee
), market = market)

end
"""
create a trade order
see: https://www.coinspot.com.au/api#placebuyorder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: must be 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Coinspot, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    sideUpper = uppercase(side);
    if functions.ccxtruthy(type_var == "market")
        throw(ExchangeError(string(self.id, " createOrder() allows limit orders only")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("cointype") => get(market, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("rate") => price
    );
    if functions.ccxtruthy(sideUpper == "BUY")
        response = Base.fetch(self.privatePostMyBuy(extend(request, params)));
    elseif functions.ccxtruthy(sideUpper == "SELL")
        response = Base.fetch(self.privatePostMySell(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " createOrder only support buy/sell side")));
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
"""
cancels an open order
see: https://www.coinspot.com.au/api#cancelbuyorder
see: https://www.coinspot.com.au/api#cancelsellorder

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Coinspot, id; symbol=nothing, params=Dict())
    side = safeString(params, "side");
    if functions.ccxtruthy(@functions.ccxt_and(side != "buy", side != "sell"))
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a side parameter, \"buy\" or \"sell\"")));
    end
    params = omit(params, "side");
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    if functions.ccxtruthy(side == "buy")
        response = Base.fetch(self.privatePostMyBuyCancel(extend(request, params)));
    else
        response = Base.fetch(self.privatePostMySellCancel(extend(request, params)));
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
function handleErrors(self::Coinspot, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    status = safeString(response, "status");
    if functions.ccxtruthy(status == "error")
        feedback = string(self.id, " ", json(response));
        throw(ExchangeError(feedback));
    end
    return nothing

end
function sign(self::Coinspot, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    isVersionedApi = functions.ccxt_isArray(api);
    version = functions.ccxtruthy(isVersionedApi) ? get(api, 1, nothing) : nothing;
    accessType = functions.ccxtruthy(isVersionedApi) ? get(api, 2, nothing) : api;
    endpoint = string("/", self.implodeParams(path, params));
    fullPath = functions.ccxtruthy((version != nothing)) ? string("/", version, endpoint) : endpoint;
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(accessType), nothing), fullPath);
    if functions.ccxtruthy(accessType == "private")
        self.checkRequiredCredentials();
        nonce = self.nonce();
        body = json(extend(Dict{Symbol, Any}(
    Symbol("nonce") => nonce
), params));
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("key") => self.apiKey,
            Symbol("sign") => self.hmac(self.encode(body), self.encode(self.secret), sha512)
        );
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
Base.getproperty(self::Coinspot, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetLatest(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "latest"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersHistory(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "orders/history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMyCoinDeposit(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/coin/deposit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMyCoinSend(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/coin/send"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostQuoteBuy(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "quote/buy"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostQuoteSell(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "quote/sell"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMyBalances(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/balances"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMyOrders(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMyBuy(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/buy"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMySell(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/sell"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMyBuyCancel(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/buy/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMySellCancel(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/sell/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyBalances(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/balances"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyBalancesCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/balances/{cointype}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyDeposits(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/deposits"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyWithdrawals(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/withdrawals"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyTransactions(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/transactions"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyTransactionsCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/transactions/{cointype}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyTransactionsOpen(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/transactions/open"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyTransactionsCointypeOpen(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/transactions/{cointype}/open"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMySendreceive(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/sendreceive"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyAffiliatepayments(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/affiliatepayments"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRoMyReferralpayments(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/referralpayments"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetLatest(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "latest"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetLatestCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "latest/{cointype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetLatestCointypeMarkettype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "latest/{cointype}/{markettype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetBuypriceCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "buyprice/{cointype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetBuypriceCointypeMarkettype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "buyprice/{cointype}/{markettype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetSellpriceCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "sellprice/{cointype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetSellpriceCointypeMarkettype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "sellprice/{cointype}/{markettype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetOrdersOpenCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "orders/open/{cointype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetOrdersOpenCointypeMarkettype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "orders/open/{cointype}/{markettype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetOrdersCompletedCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "orders/completed/{cointype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetOrdersCompletedCointypeMarkettype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "orders/completed/{cointype}/{markettype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetOrdersSummaryCompletedCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "orders/summary/completed/{cointype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetOrdersSummaryCompletedCointypeMarkettype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "orders/summary/completed/{cointype}/{markettype}"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostStatus(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "status"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMyCoinDeposit(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/coin/deposit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostQuoteBuyNow(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "quote/buy/now"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostQuoteSellNow(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "quote/sell/now"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostQuoteSwapNow(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "quote/swap/now"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMyBuy(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/buy"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMyBuyEdit(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/buy/edit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMySell(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/sell"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMySellEdit(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/sell/edit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMyBuyNow(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/buy/now"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMySellNow(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/sell/now"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMySwapNow(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/swap/now"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMyBuyCancel(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/buy/cancel"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMyBuyCancelAll(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/buy/cancel/all"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMySellCancel(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/sell/cancel"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMySellCancelAll(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/sell/cancel/all"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMyCoinWithdrawSenddetails(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/coin/withdraw/senddetails"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostMyCoinWithdrawSend(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "my/coin/withdraw/send"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoStatus(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/status"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoOrdersMarketOpen(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/orders/market/open"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoOrdersMarketCompleted(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/orders/market/completed"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyBalances(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/balances"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyBalanceCointype(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/balance/{cointype}"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyOrdersMarketOpen(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/orders/market/open"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyOrdersLimitOpen(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/orders/limit/open"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyOrdersCompleted(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/orders/completed"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyOrdersMarketCompleted(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/orders/market/completed"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMySendreceive(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/sendreceive"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyDeposits(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/deposits"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyWithdrawals(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/withdrawals"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyAffiliatepayments(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/affiliatepayments"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostRoMyReferralpayments(self::Coinspot, params=Dict(), context=Dict())
    return request(self, "ro/my/referralpayments"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Coinspot(; kwargs...)
    inst = Coinspot(Exchange(), describe, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, fetchTrades, fetchMyTrades, parseTrade, createOrder, cancelOrder, handleErrors, sign, publicGetLatest, privatePostOrders, privatePostOrdersHistory, privatePostMyCoinDeposit, privatePostMyCoinSend, privatePostQuoteBuy, privatePostQuoteSell, privatePostMyBalances, privatePostMyOrders, privatePostMyBuy, privatePostMySell, privatePostMyBuyCancel, privatePostMySellCancel, privatePostRoMyBalances, privatePostRoMyBalancesCointype, privatePostRoMyDeposits, privatePostRoMyWithdrawals, privatePostRoMyTransactions, privatePostRoMyTransactionsCointype, privatePostRoMyTransactionsOpen, privatePostRoMyTransactionsCointypeOpen, privatePostRoMySendreceive, privatePostRoMyAffiliatepayments, privatePostRoMyReferralpayments, v2PublicGetLatest, v2PublicGetLatestCointype, v2PublicGetLatestCointypeMarkettype, v2PublicGetBuypriceCointype, v2PublicGetBuypriceCointypeMarkettype, v2PublicGetSellpriceCointype, v2PublicGetSellpriceCointypeMarkettype, v2PublicGetOrdersOpenCointype, v2PublicGetOrdersOpenCointypeMarkettype, v2PublicGetOrdersCompletedCointype, v2PublicGetOrdersCompletedCointypeMarkettype, v2PublicGetOrdersSummaryCompletedCointype, v2PublicGetOrdersSummaryCompletedCointypeMarkettype, v2PrivatePostStatus, v2PrivatePostMyCoinDeposit, v2PrivatePostQuoteBuyNow, v2PrivatePostQuoteSellNow, v2PrivatePostQuoteSwapNow, v2PrivatePostMyBuy, v2PrivatePostMyBuyEdit, v2PrivatePostMySell, v2PrivatePostMySellEdit, v2PrivatePostMyBuyNow, v2PrivatePostMySellNow, v2PrivatePostMySwapNow, v2PrivatePostMyBuyCancel, v2PrivatePostMyBuyCancelAll, v2PrivatePostMySellCancel, v2PrivatePostMySellCancelAll, v2PrivatePostMyCoinWithdrawSenddetails, v2PrivatePostMyCoinWithdrawSend, v2PrivatePostRoStatus, v2PrivatePostRoOrdersMarketOpen, v2PrivatePostRoOrdersMarketCompleted, v2PrivatePostRoMyBalances, v2PrivatePostRoMyBalanceCointype, v2PrivatePostRoMyOrdersMarketOpen, v2PrivatePostRoMyOrdersLimitOpen, v2PrivatePostRoMyOrdersCompleted, v2PrivatePostRoMyOrdersMarketCompleted, v2PrivatePostRoMySendreceive, v2PrivatePostRoMyDeposits, v2PrivatePostRoMyWithdrawals, v2PrivatePostRoMyAffiliatepayments, v2PrivatePostRoMyReferralpayments)
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
function __ccxt_doc_Coinspot_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.coinspot.com.au/api#listmybalance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Coinspot_fetchBalance

function __ccxt_doc_Coinspot_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.coinspot.com.au/api#listopenorders

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Coinspot_fetchOrderBook

function __ccxt_doc_Coinspot_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.coinspot.com.au/api#latestprices

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinspot_fetchTicker

function __ccxt_doc_Coinspot_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.coinspot.com.au/api#latestprices

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinspot_fetchTickers

function __ccxt_doc_Coinspot_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://www.coinspot.com.au/api#orderhistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Coinspot_fetchTrades

function __ccxt_doc_Coinspot_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://www.coinspot.com.au/api#rotransaction

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Coinspot_fetchMyTrades

function __ccxt_doc_Coinspot_createOrder() end
"""
create a trade order
see: https://www.coinspot.com.au/api#placebuyorder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: must be 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinspot_createOrder

function __ccxt_doc_Coinspot_cancelOrder() end
"""
cancels an open order
see: https://www.coinspot.com.au/api#cancelbuyorder
see: https://www.coinspot.com.au/api#cancelsellorder

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinspot_cancelOrder
