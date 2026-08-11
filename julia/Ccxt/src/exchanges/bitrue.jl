@kwdef mutable struct Bitrue <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    nonce::Function = nonce
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchBidsAsks::Function = fetchBidsAsks
    fetchTickers::Function = fetchTickers
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    fetchOrder::Function = fetchOrder
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOpenOrders::Function = fetchOpenOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchMyTrades::Function = fetchMyTrades
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatusByType::Function = parseTransactionStatusByType
    parseTransaction::Function = parseTransaction
    withdraw::Function = withdraw
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseTransfer::Function = parseTransfer
    fetchTransfers::Function = fetchTransfers
    transfer::Function = transfer
    setLeverage::Function = setLeverage
    parseMarginModification::Function = parseMarginModification
    setMargin::Function = setMargin
    sign::Function = sign
    handleErrors::Function = handleErrors
    calculateRateLimiterCost::Function = calculateRateLimiterCost

# Generated REST endpoint fields
    spotKlinePublicGetPublicJson::Function = spotKlinePublicGetPublicJson
    spotKlinePublicGetPublicCurrencyJson::Function = spotKlinePublicGetPublicCurrencyJson
    spotV1PublicGetPing::Function = spotV1PublicGetPing
    spotV1PublicGetTime::Function = spotV1PublicGetTime
    spotV1PublicGetExchangeInfo::Function = spotV1PublicGetExchangeInfo
    spotV1PublicGetDepth::Function = spotV1PublicGetDepth
    spotV1PublicGetTrades::Function = spotV1PublicGetTrades
    spotV1PublicGetHistoricalTrades::Function = spotV1PublicGetHistoricalTrades
    spotV1PublicGetAggTrades::Function = spotV1PublicGetAggTrades
    spotV1PublicGetTicker24hr::Function = spotV1PublicGetTicker24hr
    spotV1PublicGetTickerPrice::Function = spotV1PublicGetTickerPrice
    spotV1PublicGetTickerBookTicker::Function = spotV1PublicGetTickerBookTicker
    spotV1PublicGetMarketKline::Function = spotV1PublicGetMarketKline
    spotV1PrivateGetOrder::Function = spotV1PrivateGetOrder
    spotV1PrivateGetOpenOrders::Function = spotV1PrivateGetOpenOrders
    spotV1PrivateGetAllOrders::Function = spotV1PrivateGetAllOrders
    spotV1PrivateGetAccount::Function = spotV1PrivateGetAccount
    spotV1PrivateGetMyTrades::Function = spotV1PrivateGetMyTrades
    spotV1PrivateGetEtfNetValueSymbol::Function = spotV1PrivateGetEtfNetValueSymbol
    spotV1PrivateGetWithdrawHistory::Function = spotV1PrivateGetWithdrawHistory
    spotV1PrivateGetDepositHistory::Function = spotV1PrivateGetDepositHistory
    spotV1PrivatePostOrder::Function = spotV1PrivatePostOrder
    spotV1PrivatePostWithdrawCommit::Function = spotV1PrivatePostWithdrawCommit
    spotV1PrivateDeleteOrder::Function = spotV1PrivateDeleteOrder
    spotV2PrivateGetMyTrades::Function = spotV2PrivateGetMyTrades
    fapiV1PublicGetPing::Function = fapiV1PublicGetPing
    fapiV1PublicGetTime::Function = fapiV1PublicGetTime
    fapiV1PublicGetContracts::Function = fapiV1PublicGetContracts
    fapiV1PublicGetDepth::Function = fapiV1PublicGetDepth
    fapiV1PublicGetTicker::Function = fapiV1PublicGetTicker
    fapiV1PublicGetKlines::Function = fapiV1PublicGetKlines
    fapiV2PrivateGetMyTrades::Function = fapiV2PrivateGetMyTrades
    fapiV2PrivateGetOpenOrders::Function = fapiV2PrivateGetOpenOrders
    fapiV2PrivateGetOrder::Function = fapiV2PrivateGetOrder
    fapiV2PrivateGetAccount::Function = fapiV2PrivateGetAccount
    fapiV2PrivateGetLeverageBracket::Function = fapiV2PrivateGetLeverageBracket
    fapiV2PrivateGetCommissionRate::Function = fapiV2PrivateGetCommissionRate
    fapiV2PrivateGetFuturesTransferHistory::Function = fapiV2PrivateGetFuturesTransferHistory
    fapiV2PrivateGetForceOrdersHistory::Function = fapiV2PrivateGetForceOrdersHistory
    fapiV2PrivatePostPositionMargin::Function = fapiV2PrivatePostPositionMargin
    fapiV2PrivatePostLevelEdit::Function = fapiV2PrivatePostLevelEdit
    fapiV2PrivatePostCancel::Function = fapiV2PrivatePostCancel
    fapiV2PrivatePostOrder::Function = fapiV2PrivatePostOrder
    fapiV2PrivatePostAllOpenOrders::Function = fapiV2PrivatePostAllOpenOrders
    fapiV2PrivatePostFuturesTransfer::Function = fapiV2PrivatePostFuturesTransfer
    dapiV1PublicGetPing::Function = dapiV1PublicGetPing
    dapiV1PublicGetTime::Function = dapiV1PublicGetTime
    dapiV1PublicGetContracts::Function = dapiV1PublicGetContracts
    dapiV1PublicGetDepth::Function = dapiV1PublicGetDepth
    dapiV1PublicGetTicker::Function = dapiV1PublicGetTicker
    dapiV1PublicGetKlines::Function = dapiV1PublicGetKlines
    dapiV2PrivateGetMyTrades::Function = dapiV2PrivateGetMyTrades
    dapiV2PrivateGetOpenOrders::Function = dapiV2PrivateGetOpenOrders
    dapiV2PrivateGetOrder::Function = dapiV2PrivateGetOrder
    dapiV2PrivateGetAccount::Function = dapiV2PrivateGetAccount
    dapiV2PrivateGetLeverageBracket::Function = dapiV2PrivateGetLeverageBracket
    dapiV2PrivateGetCommissionRate::Function = dapiV2PrivateGetCommissionRate
    dapiV2PrivateGetFuturesTransferHistory::Function = dapiV2PrivateGetFuturesTransferHistory
    dapiV2PrivateGetForceOrdersHistory::Function = dapiV2PrivateGetForceOrdersHistory
    dapiV2PrivatePostPositionMargin::Function = dapiV2PrivatePostPositionMargin
    dapiV2PrivatePostLevelEdit::Function = dapiV2PrivatePostLevelEdit
    dapiV2PrivatePostCancel::Function = dapiV2PrivatePostCancel
    dapiV2PrivatePostOrder::Function = dapiV2PrivatePostOrder
    dapiV2PrivatePostAllOpenOrders::Function = dapiV2PrivatePostAllOpenOrders
    dapiV2PrivatePostFuturesTransfer::Function = dapiV2PrivatePostFuturesTransfer

end
function describe(self::Bitrue, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitrue",
    Symbol("name") => "Bitrue",
    Symbol("countries") => ["SG"],
    Symbol("rateLimit") => 10,
    Symbol("certified") => false,
    Symbol("version") => "v1",
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
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
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
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
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => true,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1H",
        Symbol("2h") => "2H",
        Symbol("4h") => "4H",
        Symbol("1d") => "1D",
        Symbol("1w") => "1W"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/67abe346-1273-461a-bd7c-42fa32907c8e",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => "https://www.bitrue.com/api",
            Symbol("fapi") => "https://fapi.bitrue.com/fapi",
            Symbol("dapi") => "https://fapi.bitrue.com/dapi",
            Symbol("kline") => "https://www.bitrue.com/kline-api"
        ),
        Symbol("www") => "https://www.bitrue.com",
        Symbol("referral") => "https://www.bitrue.com/affiliate/landing?cn=600000&inviteCode=EZWETQE",
        Symbol("doc") => ["https://github.com/Bitrue-exchange/bitrue-official-api-docs", "https://www.bitrue.com/api-docs"],
        Symbol("fees") => "https://bitrue.zendesk.com/hc/en-001/articles/4405479952537"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("kline") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("public.json") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("public{currency}.json") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
)
                    )
                )
            ),
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[100, 0.24], [500, 1.2], [1000, 2.4]]
),
                        Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2
),
                        Symbol("aggTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24,
    Symbol("noSymbol") => 9.6
),
                        Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
)
                    )
                ),
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                        Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                        Symbol("myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                        Symbol("etf/net-value/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 120
),
                        Symbol("deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 120
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("withdraw/commit") => Dict{Symbol, Any}(
    Symbol("cost") => 120
)
                    ),
                    Symbol("delete") => Dict{Symbol, Any}(
                        Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    )
                )
            ),
            Symbol("v2") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2
)
                    )
                )
            )
        ),
        Symbol("fapi") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
)
                    )
                )
            ),
            Symbol("v2") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("leverageBracket") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("futures_transfer_history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("forceOrdersHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("level_edit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                        Symbol("allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("futures_transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    )
                )
            )
        ),
        Symbol("dapi") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
),
                        Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 0.24
)
                    )
                )
            ),
            Symbol("v2") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("leverageBracket") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("futures_transfer_history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("forceOrdersHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("level_edit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("futures_transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    )
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.00098"),
            Symbol("maker") => self.parseNumber("0.00098")
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("trading") => Dict{Symbol, Any}(
                Symbol("feeSide") => "quote",
                Symbol("tierBased") => true,
                Symbol("percentage") => true,
                Symbol("taker") => self.parseNumber("0.000400"),
                Symbol("maker") => self.parseNumber("0.000200"),
                Symbol("tiers") => Dict{Symbol, Any}(
                    Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.000400")], [self.parseNumber("250"), self.parseNumber("0.000400")], [self.parseNumber("2500"), self.parseNumber("0.000350")], [self.parseNumber("7500"), self.parseNumber("0.000320")], [self.parseNumber("22500"), self.parseNumber("0.000300")], [self.parseNumber("50000"), self.parseNumber("0.000270")], [self.parseNumber("100000"), self.parseNumber("0.000250")], [self.parseNumber("200000"), self.parseNumber("0.000220")], [self.parseNumber("400000"), self.parseNumber("0.000200")], [self.parseNumber("750000"), self.parseNumber("0.000170")]],
                    Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.000200")], [self.parseNumber("250"), self.parseNumber("0.000160")], [self.parseNumber("2500"), self.parseNumber("0.000140")], [self.parseNumber("7500"), self.parseNumber("0.000120")], [self.parseNumber("22500"), self.parseNumber("0.000100")], [self.parseNumber("50000"), self.parseNumber("0.000080")], [self.parseNumber("100000"), self.parseNumber("0.000060")], [self.parseNumber("200000"), self.parseNumber("0.000040")], [self.parseNumber("400000"), self.parseNumber("0.000020")], [self.parseNumber("750000"), self.parseNumber("0")]]
                )
            )
        ),
        Symbol("delivery") => Dict{Symbol, Any}(
            Symbol("trading") => Dict{Symbol, Any}(
                Symbol("feeSide") => "base",
                Symbol("tierBased") => true,
                Symbol("percentage") => true,
                Symbol("taker") => self.parseNumber("0.000500"),
                Symbol("maker") => self.parseNumber("0.000100"),
                Symbol("tiers") => Dict{Symbol, Any}(
                    Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.000500")], [self.parseNumber("250"), self.parseNumber("0.000450")], [self.parseNumber("2500"), self.parseNumber("0.000400")], [self.parseNumber("7500"), self.parseNumber("0.000300")], [self.parseNumber("22500"), self.parseNumber("0.000250")], [self.parseNumber("50000"), self.parseNumber("0.000240")], [self.parseNumber("100000"), self.parseNumber("0.000240")], [self.parseNumber("200000"), self.parseNumber("0.000240")], [self.parseNumber("400000"), self.parseNumber("0.000240")], [self.parseNumber("750000"), self.parseNumber("0.000240")]],
                    Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.000100")], [self.parseNumber("250"), self.parseNumber("0.000080")], [self.parseNumber("2500"), self.parseNumber("0.000050")], [self.parseNumber("7500"), self.parseNumber("0.0000030")], [self.parseNumber("22500"), self.parseNumber("0")], [self.parseNumber("50000"), self.parseNumber("-0.000050")], [self.parseNumber("100000"), self.parseNumber("-0.000060")], [self.parseNumber("200000"), self.parseNumber("-0.000070")], [self.parseNumber("400000"), self.parseNumber("-0.000080")], [self.parseNumber("750000"), self.parseNumber("-0.000090")]]
                )
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("createMarketBuyOrderRequiresPrice") => true
        ),
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "linear", "inverse"]
        ),
        Symbol("fetchMyTradesMethod") => "v2PrivateGetMyTrades",
        Symbol("hasAlreadyAuthenticatedSuccessfully") => false,
        Symbol("currencyToPrecisionRoundingMode") => TRUNCATE,
        Symbol("recvWindow") => 5 * 1000,
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("parseOrderToPrecision") => false,
        Symbol("newOrderRespType") => Dict{Symbol, Any}(
            Symbol("market") => "FULL",
            Symbol("limit") => "FULL"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ETH",
            Symbol("TRC20") => "TRX",
            Symbol("AETERNITY") => "Aeternity",
            Symbol("AION") => "AION",
            Symbol("ALGO") => "Algorand",
            Symbol("ASK") => "ASK",
            Symbol("ATOM") => "ATOM",
            Symbol("AVAXC") => "AVAX C-Chain",
            Symbol("BCH") => "BCH",
            Symbol("BEP2") => "BEP2",
            Symbol("BEP20") => "BEP20",
            Symbol("Bitcoin") => "Bitcoin",
            Symbol("BRP20") => "BRP20",
            Symbol("ADA") => "Cardano",
            Symbol("CASINOCOIN") => "CasinoCoin",
            Symbol("CASINOCOIN-XRPL") => "CasinoCoin XRPL",
            Symbol("CONTENTOS") => "Contentos",
            Symbol("DASH") => "Dash",
            Symbol("DECOIN") => "Decoin",
            Symbol("DFI") => "DeFiChain",
            Symbol("DGB") => "DGB",
            Symbol("DIVI") => "Divi",
            Symbol("DOGE") => "dogecoin",
            Symbol("EOS") => "EOS",
            Symbol("ETC") => "ETC",
            Symbol("FILECOIN") => "Filecoin",
            Symbol("FREETON") => "FREETON",
            Symbol("HBAR") => "HBAR",
            Symbol("HEDERA") => "Hedera Hashgraph",
            Symbol("HRC20") => "HRC20",
            Symbol("ICON") => "ICON",
            Symbol("ICP") => "ICP",
            Symbol("IGNIS") => "Ignis",
            Symbol("INTERNETCOMPUTER") => "Internet Computer",
            Symbol("IOTA") => "IOTA",
            Symbol("KAVA") => "KAVA",
            Symbol("KSM") => "KSM",
            Symbol("LTC") => "LiteCoin",
            Symbol("LUNA") => "Luna",
            Symbol("MATIC") => "MATIC",
            Symbol("MOBILECOIN") => "Mobile Coin",
            Symbol("MONACOIN") => "MonaCoin",
            Symbol("XMR") => "Monero",
            Symbol("NEM") => "NEM",
            Symbol("NEP5") => "NEP5",
            Symbol("OMNI") => "OMNI",
            Symbol("PAC") => "PAC",
            Symbol("DOT") => "Polkadot",
            Symbol("RAVEN") => "Ravencoin",
            Symbol("SAFEX") => "Safex",
            Symbol("SOL") => "SOLANA",
            Symbol("SGB") => "Songbird",
            Symbol("XML") => "Stellar Lumens",
            Symbol("XYM") => "Symbol",
            Symbol("XTZ") => "Tezos",
            Symbol("THETA") => "THETA",
            Symbol("VECHAIN") => "VeChain",
            Symbol("WANCHAIN") => "Wanchain",
            Symbol("XINFIN") => "XinFin Network",
            Symbol("XRP") => "XRP",
            Symbol("XRPL") => "XRPL",
            Symbol("ZIL") => "ZIL"
        ),
        Symbol("defaultType") => "spot",
        Symbol("timeframes") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("1m") => "1m",
                Symbol("5m") => "5m",
                Symbol("15m") => "15m",
                Symbol("30m") => "30m",
                Symbol("1h") => "1H",
                Symbol("2h") => "2H",
                Symbol("4h") => "4H",
                Symbol("12h") => "12H",
                Symbol("1d") => "1D",
                Symbol("1w") => "1W"
            ),
            Symbol("future") => Dict{Symbol, Any}(
                Symbol("1m") => "1min",
                Symbol("5m") => "5min",
                Symbol("15m") => "15min",
                Symbol("30m") => "30min",
                Symbol("1h") => "1h",
                Symbol("1d") => "1day",
                Symbol("1w") => "1week",
                Symbol("1M") => "1month"
            )
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "wallet",
            Symbol("future") => "contract",
            Symbol("swap") => "contract",
            Symbol("funding") => "wallet",
            Symbol("fund") => "wallet",
            Symbol("contract") => "contract"
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("MIM") => "MIM Swarm"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => nothing,
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
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("marketBuyByCost") => true,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => nothing,
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
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 90,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 90,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1440
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("leverage") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300
            ),
            Symbol("fetchClosedOrders") => nothing
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
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("System is under maintenance.") => OnMaintenance,
            Symbol("System abnormality") => ExchangeError,
            Symbol("You are not authorized to execute this request.") => PermissionDenied,
            Symbol("API key does not exist") => AuthenticationError,
            Symbol("Order would trigger immediately.") => OrderImmediatelyFillable,
            Symbol("Stop price would trigger immediately.") => OrderImmediatelyFillable,
            Symbol("Order would immediately match and take.") => OrderImmediatelyFillable,
            Symbol("Account has insufficient balance for requested action.") => InsufficientFunds,
            Symbol("Rest API trading is not enabled.") => ExchangeNotAvailable,
            Symbol("You don't have permission.") => PermissionDenied,
            Symbol("Market is closed.") => ExchangeNotAvailable,
            Symbol("Too many requests. Please try again later.") => DDoSProtection,
            Symbol("quantity less then minQty") => InvalidOrder,
            Symbol("-1000") => ExchangeNotAvailable,
            Symbol("-1001") => ExchangeNotAvailable,
            Symbol("-1002") => AuthenticationError,
            Symbol("-1003") => RateLimitExceeded,
            Symbol("-1013") => InvalidOrder,
            Symbol("-1015") => RateLimitExceeded,
            Symbol("-1016") => ExchangeNotAvailable,
            Symbol("-1020") => BadRequest,
            Symbol("-1021") => InvalidNonce,
            Symbol("-1022") => AuthenticationError,
            Symbol("-1100") => BadRequest,
            Symbol("-1101") => BadRequest,
            Symbol("-1102") => BadRequest,
            Symbol("-1103") => BadRequest,
            Symbol("-1104") => BadRequest,
            Symbol("-1105") => BadRequest,
            Symbol("-1106") => BadRequest,
            Symbol("-1111") => BadRequest,
            Symbol("-1112") => InvalidOrder,
            Symbol("-1114") => BadRequest,
            Symbol("-1115") => BadRequest,
            Symbol("-1116") => BadRequest,
            Symbol("-1117") => BadRequest,
            Symbol("-1166") => InvalidOrder,
            Symbol("-1118") => BadRequest,
            Symbol("-1119") => BadRequest,
            Symbol("-1120") => BadRequest,
            Symbol("-1121") => BadSymbol,
            Symbol("-1125") => AuthenticationError,
            Symbol("-1127") => BadRequest,
            Symbol("-1128") => BadRequest,
            Symbol("-1130") => BadRequest,
            Symbol("-1131") => BadRequest,
            Symbol("-1160") => InvalidOrder,
            Symbol("-1156") => InvalidOrder,
            Symbol("-2008") => AuthenticationError,
            Symbol("-2010") => ExchangeError,
            Symbol("-2011") => OrderNotFound,
            Symbol("-2013") => OrderNotFound,
            Symbol("-2014") => AuthenticationError,
            Symbol("-2015") => AuthenticationError,
            Symbol("-2017") => InsufficientFunds,
            Symbol("-2019") => InsufficientFunds,
            Symbol("-3005") => InsufficientFunds,
            Symbol("-3006") => InsufficientFunds,
            Symbol("-3008") => InsufficientFunds,
            Symbol("-3010") => ExchangeError,
            Symbol("-3015") => ExchangeError,
            Symbol("-3022") => AccountSuspended,
            Symbol("-4028") => BadRequest,
            Symbol("-3020") => InsufficientFunds,
            Symbol("-3041") => InsufficientFunds,
            Symbol("-5013") => InsufficientFunds,
            Symbol("-11008") => InsufficientFunds,
            Symbol("-4051") => InsufficientFunds
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Insufficient account balance") => InsufficientFunds,
            Symbol("has no operation privilege") => PermissionDenied,
            Symbol("MAX_POSITION") => InvalidOrder
        )
    )
))

end
function nonce(self::Bitrue, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function fetchStatus(self::Bitrue, params=Dict())
    response = Base.fetch(self.spotV1PublicGetPing(params));
    keys_var = objectKeys(response);
    keysLength = length(keys_var);
    formattedStatus = functions.ccxtruthy(keysLength) ? "maintenance" : "ok";
    return Dict{Symbol, Any}(
    Symbol("status") => formattedStatus,
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchTime(self::Bitrue, params=Dict())
    response = Base.fetch(self.spotV1PublicGetTime(params));
    return safeInteger(response, "serverTime")

end
function fetchCurrencies(self::Bitrue, params=Dict())
    response = Base.fetch(self.spotV1PublicGetExchangeInfo(params));
    coins = self.safeList(response, "coins", []);
    return self.parseCurrencies(coins)

end
function parseCurrency(self::Bitrue, rawCurrency)
    id = safeString(rawCurrency, "coin");
    name = safeString(rawCurrency, "coinFulName");
    code = self.safeCurrencyCode(id);
    networkDetails = self.safeList(rawCurrency, "chainDetail", []);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkDetails)))
        entry = get(networkDetails, j + 1, nothing);
        networkId = safeString(entry, "chain");
        network = self.networkIdToCode(networkId, code);
        if functions.ccxtruthy(network != nothing)
            networks[Symbol(network)] = Dict{Symbol, Any}(
                Symbol("info") => entry,
                Symbol("id") => networkId,
                Symbol("network") => network,
                Symbol("deposit") => self.safeBool(entry, "enableDeposit"),
                Symbol("withdraw") => self.safeBool(entry, "enableWithdraw"),
                Symbol("active") => nothing,
                Symbol("fee") => self.safeNumber(entry, "withdrawFee"),
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(entry, "minWithdraw"),
                        Symbol("max") => self.safeNumber(entry, "maxWithdraw")
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => name,
    Symbol("code") => code,
    Symbol("precision") => nothing,
    Symbol("info") => rawCurrency,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("networks") => networks,
    Symbol("fee") => nothing,
    Symbol("fees") => nothing,
    Symbol("type") => "crypto",
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    )
))

end
function fetchMarkets(self::Bitrue, params=Dict())
    promisesRaw = [];
    types = nothing;
    defaultTypes = ["spot", "linear", "inverse"];
    fetchMarketsOptions = self.safeDict(self.options, "fetchMarkets");
    if functions.ccxtruthy(fetchMarketsOptions != nothing)
        types = self.safeList(fetchMarketsOptions, "types", defaultTypes);
    else
        types = self.safeList(self.options, "fetchMarkets", defaultTypes);
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        marketType = get(types, i + 1, nothing);
        if functions.ccxtruthy(marketType == "spot")
                        push!(promisesRaw, self.spotV1PublicGetExchangeInfo(params));
        elseif functions.ccxtruthy(marketType == "linear")
            push!(promisesRaw, self.fapiV1PublicGetContracts(params));
        else
            if functions.ccxtruthy(marketType == "inverse")
                                push!(promisesRaw, self.dapiV1PublicGetContracts(params));
            else
                throw(ExchangeError(string(self.id, " fetchMarkets() this.options fetchMarkets \"", marketType, "\" is not a supported market type")));
            end

        end
        i += 1
    end
    promises = Base.fetch(asyncmap(Base.fetch, promisesRaw));
    spotMarkets = safeValue(safeValue(promises, 0), "symbols", []);
    futureMarkets = safeValue(promises, 1);
    deliveryMarkets = safeValue(promises, 2);
    markets = spotMarkets;
    markets = arrayConcat(markets, futureMarkets);
    markets = arrayConcat(markets, deliveryMarkets);
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    return self.parseMarkets(markets)

end
function parseMarket(self::Bitrue, market)
    id = safeString(market, "symbol", "");
    lowercaseId = safeStringLower(market, "symbol");
    side = safeInteger(market, "side");
    type_var = "spot";
    isLinear = nothing;
    isInverse = nothing;
    if functions.ccxtruthy(side == nothing)
        type_var = "spot";
    else
        type_var = "swap";
        isLinear = (side == 1);
        isInverse = (side == 0);
    end
    isContract = (type_var != "spot");
    baseId = safeString(market, "baseAsset");
    quoteId = safeString(market, "quoteAsset");
    settleId = nothing;
    settle = nothing;
    if functions.ccxtruthy(isContract)
        symbolSplit = split(id, "-");
        baseId = safeString(symbolSplit, 1);
        quoteId = safeString(symbolSplit, 2);
        if functions.ccxtruthy(isLinear)
            settleId = quoteId;
        else
            settleId = baseId;
        end
        settle = self.safeCurrencyCode(settleId);
    end
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(settle != nothing)
        symbol += string(":", settle);
    end
    filters = self.safeList(market, "filters", []);
    filtersByType = indexBy(filters, "filterType");
    status = safeString(market, "status");
    priceFilter = self.safeDict(filtersByType, "PRICE_FILTER", Dict{Symbol, Any}());
    amountFilter = self.safeDict(filtersByType, "LOT_SIZE", Dict{Symbol, Any}());
    defaultPricePrecision = safeString(market, "pricePrecision");
    defaultAmountPrecision = safeString(market, "quantityPrecision");
    pricePrecision = safeString(priceFilter, "priceScale", defaultPricePrecision);
    amountPrecision = safeString(amountFilter, "volumeScale", defaultAmountPrecision);
    multiplier = safeString(market, "multiplier");
    maxQuantity = self.safeNumber(amountFilter, "maxQty");
    if functions.ccxtruthy(maxQuantity == nothing)
        maxQuantity = self.safeNumber(market, "maxValidOrder");
    end
    minCost = self.safeNumber(amountFilter, "minVal");
    if functions.ccxtruthy(minCost == nothing)
        minCost = self.safeNumber(market, "minOrderMoney");
    end
    isSpot = (type_var == "spot");
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("lowercaseId") => lowercaseId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => isSpot,
    Symbol("margin") => false,
    Symbol("swap") => isContract,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => (status == "TRADING"),
    Symbol("contract") => isContract,
    Symbol("linear") => isLinear,
    Symbol("inverse") => isInverse,
    Symbol("contractSize") => self.parseNumber(stringAbs(multiplier)),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(amountPrecision)),
        Symbol("price") => self.parseNumber(self.parsePrecision(pricePrecision))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(amountFilter, "minQty"),
            Symbol("max") => maxQuantity
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(priceFilter, "minPrice"),
            Symbol("max") => self.safeNumber(priceFilter, "maxPrice")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => minCost,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function parseBalance(self::Bitrue, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    timestamp = safeInteger(response, "updateTime");
    balances = safeValue2(response, "balances", "account", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        currencyId = safeString2(balance, "asset", "marginCoin");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString2(balance, "free", "accountNormal");
        account[Symbol("used")] = safeString2(balance, "locked", "accountLock");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    result[Symbol("timestamp")] = timestamp;
    result[Symbol("datetime")] = self.iso8601(timestamp);
    return self.safeBalance(result)

end
function fetchBalance(self::Bitrue, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchBalance", nothing, params);
    response = nothing;
    result = nothing;
    if functions.ccxtruthy(type_var == "swap")
        if functions.ccxtruthy(@functions.ccxt_and(subType != nothing, subType == "inverse"))
            response = Base.fetch(self.dapiV2PrivateGetAccount(params));
            result = self.safeDict(response, "data", Dict{Symbol, Any}());
        else
            response = Base.fetch(self.fapiV2PrivateGetAccount(params));
            result = self.safeDict(response, "data", Dict{Symbol, Any}());
        end
    else
        response = Base.fetch(self.spotV1PrivateGetAccount(params));
        result = response;
    end
    return self.parseBalance(result)

end
function fetchOrderBook(self::Bitrue, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("contractName") => get(market, Symbol("id"), nothing)
        );
        if functions.ccxtruthy(limit != nothing)
            if functions.ccxtruthy(functions.ccxt_gt(limit, 100))
                limit = 100;
            end
            request[Symbol("limit")] = limit;
        end
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV1PublicGetDepth(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV1PublicGetDepth(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        if functions.ccxtruthy(limit != nothing)
            if functions.ccxtruthy(functions.ccxt_gt(limit, 1000))
                limit = 1000;
            end
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.spotV1PublicGetDepth(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchOrderBook only support spot & swap markets")));
    end
    timestamp = safeInteger2(response, "time", "lastUpdateId");
    orderbook = self.parseOrderBook(response, symbol, timestamp);
    orderbook[Symbol("nonce")] = safeInteger(response, "lastUpdateId");
    return orderbook

end
function parseTicker(self::Bitrue, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    last_var = safeString2(ticker, "lastPrice", "last");
    timestamp = safeInteger(ticker, "time");
    percentage = nothing;
    if functions.ccxtruthy(self.safeBool(market, "swap"))
        percentage = stringMul(safeString(ticker, "rose"), "100");
    else
        percentage = safeString(ticker, "priceChangePercent");
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(ticker, "highPrice", "high"),
    Symbol("low") => safeString2(ticker, "lowPrice", "low"),
    Symbol("bid") => safeString2(ticker, "bidPrice", "buy"),
    Symbol("bidVolume") => safeString(ticker, "bidQty"),
    Symbol("ask") => safeString2(ticker, "askPrice", "sell"),
    Symbol("askVolume") => safeString(ticker, "askQty"),
    Symbol("vwap") => safeString(ticker, "weightedAvgPrice"),
    Symbol("open") => safeString(ticker, "openPrice"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => safeString(ticker, "priceChange"),
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString2(ticker, "volume", "vol"),
    Symbol("quoteVolume") => safeString(ticker, "quoteVolume"),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Bitrue, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = nothing;
    data = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("contractName") => get(market, Symbol("id"), nothing)
        );
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV1PublicGetTicker(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV1PublicGetTicker(extend(request, params)));
        end
        data = response;
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        response = Base.fetch(self.spotV1PublicGetTicker24hr(extend(request, params)));
        data = self.safeDict(response, 0, Dict{Symbol, Any}());
    else
        throw(NotSupported(string(self.id, " fetchTicker only support spot & swap markets")));
    end
    return self.parseTicker(data, market)

end
function fetchOHLCV(self::Bitrue, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    timeframes = self.safeDict(self.options, "timeframes", Dict{Symbol, Any}());
    response = nothing;
    data = [];
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        timeframesFuture = self.safeDict(timeframes, "future", Dict{Symbol, Any}());
        request = Dict{Symbol, Any}(
            Symbol("contractName") => get(market, Symbol("id"), nothing),
            Symbol("interval") => safeString(timeframesFuture, timeframe, "1min")
        );
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV1PublicGetKlines(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV1PublicGetKlines(extend(request, params)));
        end
        data = response;
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        timeframesSpot = self.safeDict(timeframes, "spot", Dict{Symbol, Any}());
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing),
            Symbol("scale") => safeString(timeframesSpot, timeframe, "1m")
        );
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        until = safeInteger(params, "until");
        if functions.ccxtruthy(until != nothing)
            params = omit(params, "until");
            request[Symbol("fromIdx")] = until;
        end
        response = Base.fetch(self.spotV1PublicGetMarketKline(extend(request, params)));
        data = self.safeList(response, "data", []);
    else
        throw(NotSupported(string(self.id, " fetchOHLCV only support spot & swap markets")));
    end
    return self.parseOHLCVs(data, market, timeframe, since, limit)

end
function parseOHLCV(self::Bitrue, ohlcv, market=nothing)
    timestamp = safeTimestamp(ohlcv, "i");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeInteger(ohlcv, "idx");
    end
    return [timestamp, self.safeNumber2(ohlcv, "o", "open"), self.safeNumber2(ohlcv, "h", "high"), self.safeNumber2(ohlcv, "l", "low"), self.safeNumber2(ohlcv, "c", "close"), self.safeNumber2(ohlcv, "v", "vol")]

end
function fetchBidsAsks(self::Bitrue, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, false);
    first_var = safeString(symbols, 0);
    market = self.market(first_var);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("contractName") => get(market, Symbol("id"), nothing)
        );
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV1PublicGetTicker(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV1PublicGetTicker(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        response = Base.fetch(self.spotV1PublicGetTickerBookTicker(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchBidsAsks only support spot & swap markets")));
    end
    data = Dict{Symbol, Any}();
    data[Symbol(market[Symbol("id")])] = response;
    return self.parseTickers(data, symbols)

end
function fetchTickers(self::Bitrue, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = [];
    data = [];
    request = Dict{Symbol, Any}();
    type_var = nothing;
    if functions.ccxtruthy(symbols != nothing)
        first_var = safeString(symbols, 0);
        market = self.market(first_var);
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            throw(NotSupported(string(self.id, " fetchTickers does not support swap markets, please use fetchTicker instead")));
        elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            response = Base.fetch(self.spotV1PublicGetTicker24hr(extend(request, params)));
            data = toArray(response);
        else
            throw(NotSupported(string(self.id, " fetchTickers only support spot & swap markets")));
        end
    else
        (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", nothing, params);
        if functions.ccxtruthy(type_var != "spot")
            throw(NotSupported(string(self.id, " fetchTickers only support spot when symbols are not proved")));
        end
        response = Base.fetch(self.spotV1PublicGetTicker24hr(extend(request, params)));
        data = toArray(response);
    end
    tickers = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        ticker = self.safeDict(data, i, Dict{Symbol, Any}());
        marketId = safeString(ticker, "symbol");
        if functions.ccxtruthy(marketId == nothing)
            i += 1; continue
        end
        market = self.safeMarket(marketId);
        tickers[Symbol(market[Symbol("id")])] = ticker;
        i += 1
    end
    return self.parseTickers(tickers, symbols)

end
function parseTrade(self::Bitrue, trade, market=nothing)
    timestamp = safeInteger2(trade, "ctime", "time");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "qty");
    marketId = safeString2(trade, "symbol", "contractName");
    symbol = self.safeSymbol(marketId, market);
    orderId = safeString(trade, "orderId");
    id = safeString2(trade, "id", "tradeId");
    side = nothing;
    buyerMaker = self.safeBool(trade, "isBuyerMaker");
    isBuyer = self.safeBool(trade, "isBuyer");
    if functions.ccxtruthy(buyerMaker != nothing)
        side = functions.ccxtruthy(buyerMaker) ? "sell" : "buy";
    end
    if functions.ccxtruthy(isBuyer != nothing)
        side = functions.ccxtruthy(isBuyer) ? "buy" : "sell";
    end
    fee = nothing;
    if functions.ccxtruthy(ccxt_in("commission", trade))
        fee = Dict{Symbol, Any}(
            Symbol("cost") => safeString2(trade, "commission", "fee"),
            Symbol("currency") => self.safeCurrencyCode(safeString(trade, "commissionAssert"))
        );
    end
    takerOrMaker = nothing;
    isMaker = self.safeBool(trade, "isMaker");
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Bitrue, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = [];
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.spotV1PublicGetTrades(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchTrades only support spot markets")));
    end
    return self.parseTrades(response, market, since, limit)

end
function parseOrderStatus(self::Bitrue, status)
    statuses = Dict{Symbol, Any}(
        Symbol("INIT") => "open",
        Symbol("PENDING_CREATE") => "open",
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("PENDING_CANCEL") => "canceling",
        Symbol("REJECTED") => "rejected",
        Symbol("EXPIRED") => "expired"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bitrue, order, market=nothing)
    status = self.parseOrderStatus(safeString2(order, "status", "orderStatus"));
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market);
    filled = safeString(order, "executedQty");
    timestamp = nothing;
    lastTradeTimestamp = nothing;
    if functions.ccxtruthy(ccxt_in("time", order))
        timestamp = safeInteger(order, "time");
    elseif functions.ccxtruthy(ccxt_in("transactTime", order))
        timestamp = safeInteger(order, "transactTime");
    else
        if functions.ccxtruthy(ccxt_in("updateTime", order))
            if functions.ccxtruthy(status == "open")
                if functions.ccxtruthy(stringGt(filled, "0"))
                    lastTradeTimestamp = safeInteger(order, "updateTime");
                else
                    timestamp = safeInteger(order, "updateTime");
                end
            end
        end

    end
    average = safeString(order, "avgPrice");
    price = safeString(order, "price");
    amount = safeString(order, "origQty");
    cost = safeString2(order, "cummulativeQuoteQty", "cumQuote");
    id = safeString(order, "orderId");
    type_var = safeStringLower(order, "type");
    side = safeStringLower(order, "side");
    fills = self.safeList(order, "fills", []);
    clientOrderId = safeString(order, "clientOrderId");
    timeInForce = safeString(order, "timeInForce");
    postOnly = @functions.ccxt_or(@functions.ccxt_or((type_var == "limit_maker"), (timeInForce == "GTX")), (type_var == "post_only"));
    if functions.ccxtruthy(type_var == "limit_maker")
        type_var = "limit";
    end
    triggerPrice = self.parseNumber(omitZero(safeString(order, "stopPrice")));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("trades") => fills
), market)

end
function createMarketBuyOrderWithCost(self::Bitrue, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports swap orders only")));
    end
    params[Symbol("createMarketBuyOrderRequiresPrice")] = false;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, nothing, params))

end
function createOrder(self::Bitrue, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = nothing;
    data = Dict{Symbol, Any}();
    uppercaseType = uppercase(type_var);
    request = Dict{Symbol, Any}(
        Symbol("side") => uppercase(side),
        Symbol("type") => uppercaseType
    );
    if functions.ccxtruthy(uppercaseType == "LIMIT")
        if functions.ccxtruthy(price == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a price argument")));
        end
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        isMarket = uppercaseType == "MARKET";
        timeInForce = safeStringLower(params, "timeInForce");
        postOnly = self.isPostOnly(isMarket, nothing, params);
        if functions.ccxtruthy(postOnly)
            request[Symbol("type")] = "POST_ONLY";
        elseif functions.ccxtruthy(timeInForce == "fok")
            request[Symbol("type")] = "FOK";
        else
            if functions.ccxtruthy(timeInForce == "ioc")
                request[Symbol("type")] = "IOC";
            end

        end
        request[Symbol("contractName")] = get(market, Symbol("id"), nothing);
        createMarketBuyOrderRequiresPrice = true;
        (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(isMarket, (side == "buy")), createMarketBuyOrderRequiresPrice))
            cost = safeString(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(@functions.ccxt_and(price == nothing, cost == nothing))
                throw(InvalidOrder(string(self.id, " createOrder() requires the price argument with swap market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options[\"createMarketBuyOrderRequiresPrice\"] = false to supply the cost in the amount argument (the exchange-specific behaviour)")));
            else
                amountString = numberToString(amount);
                priceString = numberToString(price);
                quoteAmount = stringMul(amountString, priceString);
                requestAmount = functions.ccxtruthy((cost != nothing)) ? cost : quoteAmount;
                request[Symbol("amount")] = self.costToPrecision(symbol, requestAmount);
                request[Symbol("volume")] = self.costToPrecision(symbol, requestAmount);
            end
        else
            request[Symbol("amount")] = self.parseToNumeric(amount);
            request[Symbol("volume")] = self.parseToNumeric(amount);
        end
        request[Symbol("positionType")] = 1;
        reduceOnly = safeValue2(params, "reduceOnly", "reduce_only");
        request[Symbol("open")] = functions.ccxtruthy(reduceOnly) ? "CLOSE" : "OPEN";
        leverage = safeString(params, "leverage", "1");
        request[Symbol("leverage")] = self.parseToNumeric(leverage);
        params = omit(params, ["leverage", "reduceOnly", "reduce_only", "timeInForce"]);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV2PrivatePostOrder(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV2PrivatePostOrder(extend(request, params)));
        end
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        validOrderTypes = safeValue(get(market, Symbol("info"), nothing), "orderTypes");
        if functions.ccxtruthy(!functions.ccxtruthy(inArray(uppercaseType, validOrderTypes)))
            throw(InvalidOrder(string(self.id, " ", type_var, " is not a valid order type in market ", symbol)));
        end
        clientOrderId = safeString2(params, "newClientOrderId", "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            params = omit(params, ["newClientOrderId", "clientOrderId"]);
            request[Symbol("newClientOrderId")] = clientOrderId;
        end
        triggerPrice = safeValue2(params, "triggerPrice", "stopPrice");
        if functions.ccxtruthy(triggerPrice != nothing)
            params = omit(params, ["triggerPrice", "stopPrice"]);
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        end
        response = Base.fetch(self.spotV1PrivatePostOrder(extend(request, params)));
        data = response;
    else
        throw(NotSupported(string(self.id, " createOrder only support spot & swap markets")));
    end
    return self.parseOrder(data, market)

end
function fetchOrder(self::Bitrue, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    origClientOrderId = safeValue2(params, "origClientOrderId", "clientOrderId");
    params = omit(params, ["origClientOrderId", "clientOrderId"]);
    response = nothing;
    data = Dict{Symbol, Any}();
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(origClientOrderId == nothing)
        request[Symbol("orderId")] = id;
    else
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            request[Symbol("clientOrderId")] = origClientOrderId;
        else
            request[Symbol("origClientOrderId")] = origClientOrderId;
        end
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("contractName")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV2PrivateGetOrder(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV2PrivateGetOrder(extend(request, params)));
        end
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("orderId")] = id;
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.spotV1PrivateGetOrder(extend(request, params)));
        data = response;
    else
        throw(NotSupported(string(self.id, " fetchOrder only support spot & swap markets")));
    end
    return self.parseOrder(data, market)

end
function fetchClosedOrders(self::Bitrue, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " fetchClosedOrders only support spot markets")));
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
    response = Base.fetch(self.spotV1PrivateGetAllOrders(extend(request, params)));
    return self.parseOrders(response, market, since, limit)

end
function fetchOpenOrders(self::Bitrue, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = nothing;
    data = [];
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("contractName")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV2PrivateGetOpenOrders(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV2PrivateGetOpenOrders(extend(request, params)));
        end
        data = self.safeList(response, "data", []);
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.spotV1PrivateGetOpenOrders(extend(request, params)));
        data = response;
    else
        throw(NotSupported(string(self.id, " fetchOpenOrders only support spot & swap markets")));
    end
    return self.parseOrders(data, market, since, limit)

end
function cancelOrder(self::Bitrue, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    origClientOrderId = safeValue2(params, "origClientOrderId", "clientOrderId");
    params = omit(params, ["origClientOrderId", "clientOrderId"]);
    response = nothing;
    data = Dict{Symbol, Any}();
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(origClientOrderId == nothing)
        request[Symbol("orderId")] = id;
    else
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            request[Symbol("clientOrderId")] = origClientOrderId;
        else
            request[Symbol("origClientOrderId")] = origClientOrderId;
        end
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("contractName")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV2PrivatePostCancel(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV2PrivatePostCancel(extend(request, params)));
        end
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.spotV1PrivateDeleteOrder(extend(request, params)));
        data = response;
    else
        throw(NotSupported(string(self.id, " cancelOrder only support spot & swap markets")));
    end
    return self.parseOrder(data, market)

end
function cancelAllOrders(self::Bitrue, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = nothing;
    data = [];
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("contractName") => get(market, Symbol("id"), nothing)
        );
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV2PrivatePostAllOpenOrders(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV2PrivatePostAllOpenOrders(extend(request, params)));
        end
        data = self.safeList(response, "data", []);
    else
        throw(NotSupported(string(self.id, " cancelAllOrders only support future markets")));
    end
    return self.parseOrders(data, market)

end
function fetchMyTrades(self::Bitrue, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    market = self.market(symbol);
    response = nothing;
    data = [];
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(limit, 1000))
            limit = 1000;
        end
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("contractName")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiV2PrivateGetMyTrades(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiV2PrivateGetMyTrades(extend(request, params)));
        end
        data = self.safeList(response, "data", []);
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.spotV2PrivateGetMyTrades(extend(request, params)));
        data = response;
    else
        throw(NotSupported(string(self.id, " fetchMyTrades only support spot & swap markets")));
    end
    return self.parseTrades(data, market, since, limit)

end
function fetchDeposits(self::Bitrue, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDeposits() requires a code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("status") => 1
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.spotV1PrivateGetDepositHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function fetchWithdrawals(self::Bitrue, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchWithdrawals() requires a code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("status") => 5
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.spotV1PrivateGetWithdrawHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency)

end
function parseTransactionStatusByType(self::Bitrue, status, type_var=nothing)
    statusesByType = Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("0") => "pending",
            Symbol("1") => "ok"
        ),
        Symbol("withdrawal") => Dict{Symbol, Any}(
            Symbol("0") => "pending",
            Symbol("5") => "ok",
            Symbol("6") => "canceled"
        )
    );
    statuses = self.safeDict(statusesByType, type_var, Dict{Symbol, Any}());
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bitrue, transaction, currency=nothing)
    id = safeString2(transaction, "id", "withdrawId");
    tagType = safeString(transaction, "tagType");
    addressTo = safeString(transaction, "addressTo");
    addressFrom = safeString(transaction, "addressFrom");
    tagTo = nothing;
    tagFrom = nothing;
    if functions.ccxtruthy(tagType != nothing)
        if functions.ccxtruthy(addressTo != nothing)
            parts = split(addressTo, "_");
            addressTo = safeString(parts, 0);
            tagTo = safeString(parts, 1);
        end
        if functions.ccxtruthy(addressFrom != nothing)
            parts = split(addressFrom, "_");
            addressFrom = safeString(parts, 0);
            tagFrom = safeString(parts, 1);
        end
    end
    txid = safeString(transaction, "txid");
    timestamp = safeInteger(transaction, "createdAt");
    updated = safeInteger(transaction, "updatedAt");
    payAmount = (ccxt_in("payAmount", transaction));
    ctime = (ccxt_in("ctime", transaction));
    type_var = functions.ccxtruthy((@functions.ccxt_or(payAmount, ctime))) ? "withdrawal" : "deposit";
    status = self.parseTransactionStatusByType(safeString(transaction, "status"), type_var);
    amount = self.safeNumber(transaction, "amount");
    network = nothing;
    currencyId = safeString2(transaction, "symbol", "coin");
    if functions.ccxtruthy(currencyId != nothing)
        parts = split(currencyId, "_");
        currencyId = safeString(parts, 0);
        networkId = safeString(parts, 1);
        if functions.ccxtruthy(networkId != nothing)
            network = uppercase(networkId);
        end
    end
    code = self.safeCurrencyCode(currencyId, currency);
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => network,
    Symbol("address") => addressTo,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => addressFrom,
    Symbol("tag") => tagTo,
    Symbol("tagTo") => tagTo,
    Symbol("tagFrom") => tagFrom,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("internal") => false,
    Symbol("comment") => nothing,
    Symbol("fee") => fee
)

end
function withdraw(self::Bitrue, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("addressTo") => address
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("chainName")] = self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing));
    end
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("tag")] = tag;
    end
    response = Base.fetch(self.spotV1PrivatePostWithdrawCommit(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransaction(data, currency)

end
function parseDepositWithdrawFee(self::Bitrue, fee, currency=nothing)
    chainDetails = self.safeList(fee, "chainDetail", []);
    chainDetailLength = length(chainDetails);
    result = Dict{Symbol, Any}(
        Symbol("info") => fee,
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("fee") => nothing,
            Symbol("percentage") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("fee") => nothing,
            Symbol("percentage") => nothing
        ),
        Symbol("networks") => Dict{Symbol, Any}()
    );
    if functions.ccxtruthy(chainDetailLength != 0)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, chainDetailLength))
            chainDetail = get(chainDetails, i + 1, nothing);
            networkId = safeString(chainDetail, "chain");
            currencyCode = safeString(currency, "code");
            networkCode = self.networkIdToCode(networkId, currencyCode);
            if functions.ccxtruthy(networkCode != nothing)
                result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("fee") => self.safeNumber(chainDetail, "withdrawFee"),
                        Symbol("percentage") => false
                    )
                );
            end
            if functions.ccxtruthy(chainDetailLength == 1)
                result[Symbol("withdraw")][Symbol("fee")] = self.safeNumber(chainDetail, "withdrawFee");
                result[Symbol("withdraw")][Symbol("percentage")] = false;
            end
            i += 1
        end

    end
    return result

end
function fetchDepositWithdrawFees(self::Bitrue, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.spotV1PublicGetExchangeInfo(params));
    coins = self.safeList(response, "coins");
    return self.parseDepositWithdrawFees(coins, codes, "coin")

end
function parseTransfer(self::Bitrue, transfer, currency=nothing)
    transferType = safeString(transfer, "transferType");
    fromAccount = nothing;
    toAccount = nothing;
    if functions.ccxtruthy(transferType != nothing)
        accountSplit = split(transferType, "_to_");
        fromAccount = safeString(accountSplit, 0);
        toAccount = safeString(accountSplit, 1);
    end
    timestamp = safeInteger(transfer, "ctime");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => safeString(currency, "code"),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => "ok"
)

end
function fetchTransfers(self::Bitrue, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = safeString2(params, "type", "transferType");
    request = Dict{Symbol, Any}(
        Symbol("transferType") => type_var
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coinSymbol")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("beginTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(limit, 200))
            limit = 200;
        end
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.fapiV2PrivateGetFuturesTransferHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransfers(data, currency, since, limit)

end
function transfer(self::Bitrue, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountTypes = self.safeDict(self.options, "accountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountTypes, fromAccount, fromAccount);
    toId = safeString(accountTypes, toAccount, toAccount);
    request = Dict{Symbol, Any}(
        Symbol("coinSymbol") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("transferType") => string(fromId, "_to_", toId)
    );
    response = Base.fetch(self.fapiV2PrivatePostFuturesTransfer(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransfer(data, currency)

end
function setLeverage(self::Bitrue, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 125))))
        throw(BadRequest(string(self.id, " leverage should be between 1 and 125")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = Dict{Symbol, Any}();
    request = Dict{Symbol, Any}(
        Symbol("contractName") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage
    );
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " setLeverage only support swap markets")));
    end
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.fapiV2PrivatePostLevelEdit(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.dapiV2PrivatePostLevelEdit(extend(request, params)));
    end
    return response

end
function parseMarginModification(self::Bitrue, data, market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => nothing,
    Symbol("status") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function setMargin(self::Bitrue, symbol, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " setMargin only support swap markets")));
    end
    response = nothing;
    request = Dict{Symbol, Any}(
        Symbol("contractName") => get(market, Symbol("id"), nothing),
        Symbol("amount") => self.parseToNumeric(amount)
    );
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.fapiV2PrivatePostPositionMargin(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.dapiV2PrivatePostPositionMargin(extend(request, params)));
    end
    return self.parseMarginModification(response, market)

end
function sign(self::Bitrue, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    type_var = safeString(api, 0);
    version = safeString(api, 1);
    access = safeString(api, 2);
    url = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and(type_var == "api", version == "kline")), (@functions.ccxt_and(type_var == "open", findfirst("listenKey", path) !== nothing))))
        url = get(get(self.urls, Symbol("api"), nothing), Symbol(type_var), nothing);
    else
        url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(type_var), nothing), "/", version);
    end
    url = string(url, "/", self.implodeParams(path, params));
    params = omit(params, self.extractParams(path));
    if functions.ccxtruthy(access == "private")
        self.checkRequiredCredentials();
        recvWindow = safeInteger(self.options, "recvWindow", 5000);
        if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "open"))
            query = self.urlencode(extend(Dict{Symbol, Any}(
                Symbol("timestamp") => self.nonce(),
                Symbol("recvWindow") => recvWindow
            ), params));
            signature = self.hmac(self.encode(query), self.encode(self.secret), sha256);
            query += string("&", "signature=", signature);
            headers = Dict{Symbol, Any}(
                Symbol("X-MBX-APIKEY") => self.apiKey
            );
            if functions.ccxtruthy(@functions.ccxt_or((method == "GET"), (method == "DELETE")))
                url += string("?", query);
            else
                body = query;
                headers[Symbol("Content-Type")] = "application/x-www-form-urlencoded";
            end
        else
            timestamp = string(self.nonce());
            signPath = nothing;
            if functions.ccxtruthy(type_var == "fapi")
                signPath = "/fapi";
            elseif functions.ccxtruthy(type_var == "dapi")
                signPath = "/dapi";
            end
            signPath = string(signPath, "/", version, "/", path);
            signMessage = string(timestamp, method, signPath);
            if functions.ccxtruthy(method == "GET")
                keys_var = objectKeys(params);
                keysLength = length(keys_var);
                if functions.ccxtruthy(functions.ccxt_gt(keysLength, 0))
                    signMessage += string("?", self.urlencode(params));
                end
                signature = self.hmac(self.encode(signMessage), self.encode(self.secret), sha256);
                headers = Dict{Symbol, Any}(
                    Symbol("X-CH-APIKEY") => self.apiKey,
                    Symbol("X-CH-SIGN") => signature,
                    Symbol("X-CH-TS") => timestamp
                );
                url += string("?", self.urlencode(params));
            else
                query = extend(Dict{Symbol, Any}(
                    Symbol("recvWindow") => recvWindow
                ), params);
                body = json(query);
                signMessage += body;
                signature = self.hmac(self.encode(signMessage), self.encode(self.secret), sha256);
                headers = Dict{Symbol, Any}(
                    Symbol("Content-Type") => "application/json",
                    Symbol("X-CH-APIKEY") => self.apiKey,
                    Symbol("X-CH-SIGN") => signature,
                    Symbol("X-CH-TS") => timestamp
                );
            end
        end
    else
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitrue, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or((code == 418), (code == 429)))
        throw(DDoSProtection(string(self.id, " ", code, " ", reason, " ", body)));
    end
    if functions.ccxtruthy(functions.ccxt_ge(code, 400))
        if functions.ccxtruthy(findfirst("Price * QTY is zero or less", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order cost = amount * price is zero or less ", body)));
        end
        if functions.ccxtruthy(findfirst("LOT_SIZE", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order amount should be evenly divisible by lot size ", body)));
        end
        if functions.ccxtruthy(findfirst("PRICE_FILTER", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ", body)));
        end
    end
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    success = self.safeBool(response, "success", true);
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        messageInner = safeString(response, "msg");
        parsedMessage = nothing;
        if functions.ccxtruthy(messageInner != nothing)
            try
                parsedMessage = functions.ccxt_json_parse(messageInner);
            catch e
                parsedMessage = nothing;

            end
            if functions.ccxtruthy(parsedMessage != nothing)
                response = parsedMessage;
            end
        end
    end
    message = safeString(response, "msg");
    if functions.ccxtruthy(message != nothing)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, string(self.id, " ", message));
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, string(self.id, " ", message));
    end
    error = safeString(response, "code");
    if functions.ccxtruthy(error != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((error == "200"), stringEquals(error, "0")))
                return nothing
        end
        if functions.ccxtruthy(@functions.ccxt_and((error == "-2015"), get(self.options, Symbol("hasAlreadyAuthenticatedSuccessfully"), nothing)))
            throw(DDoSProtection(string(self.id, " temporary banned: ", body)));
        end
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
        throw(ExchangeError(feedback));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        throw(ExchangeError(string(self.id, " ", body)));
    end
    return nothing

end
function calculateRateLimiterCost(self::Bitrue, api, method, path, params, config=Dict())
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noSymbol", config)), !functions.ccxtruthy((ccxt_in("symbol", params)))))
            return get(config, Symbol("noSymbol"), nothing)
    elseif functions.ccxtruthy(@functions.ccxt_and((ccxt_in("byLimit", config)), (ccxt_in("limit", params))))
        limit = get(params, Symbol("limit"), nothing);
        byLimit = self.safeList(config, "byLimit", []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(byLimit)))
            entry = get(byLimit, i + 1, nothing);
            if functions.ccxtruthy(functions.ccxt_le(limit, get(entry, 1, nothing)))
                    return get(entry, 2, nothing)
            end
            i += 1
        end
    end
    return safeValue(config, "cost", 1)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitrue, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function spotKlinePublicGetPublicJson(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "public.json", ["spot", "kline", "public"], "GET", params, nothing, nothing, Dict())
end

function spotKlinePublicGetPublicCurrencyJson(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "public{currency}.json", ["spot", "kline", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetPing(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "ping", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetTime(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "time", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetExchangeInfo(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "exchangeInfo", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetDepth(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "depth", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetTrades(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "trades", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetHistoricalTrades(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "historicalTrades", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetAggTrades(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "aggTrades", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetTicker24hr(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "ticker/24hr", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetTickerPrice(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "ticker/price", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetTickerBookTicker(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "ticker/bookTicker", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PublicGetMarketKline(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "market/kline", ["spot", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivateGetOrder(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "order", ["spot", "v1", "private"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivateGetOpenOrders(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "openOrders", ["spot", "v1", "private"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivateGetAllOrders(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "allOrders", ["spot", "v1", "private"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivateGetAccount(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "account", ["spot", "v1", "private"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivateGetMyTrades(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "myTrades", ["spot", "v1", "private"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivateGetEtfNetValueSymbol(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "etf/net-value/{symbol}", ["spot", "v1", "private"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivateGetWithdrawHistory(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "withdraw/history", ["spot", "v1", "private"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivateGetDepositHistory(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "deposit/history", ["spot", "v1", "private"], "GET", params, nothing, nothing, Dict())
end

function spotV1PrivatePostOrder(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "order", ["spot", "v1", "private"], "POST", params, nothing, nothing, Dict())
end

function spotV1PrivatePostWithdrawCommit(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "withdraw/commit", ["spot", "v1", "private"], "POST", params, nothing, nothing, Dict())
end

function spotV1PrivateDeleteOrder(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "order", ["spot", "v1", "private"], "DELETE", params, nothing, nothing, Dict())
end

function spotV2PrivateGetMyTrades(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "myTrades", ["spot", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV1PublicGetPing(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "ping", ["fapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function fapiV1PublicGetTime(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "time", ["fapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function fapiV1PublicGetContracts(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "contracts", ["fapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function fapiV1PublicGetDepth(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "depth", ["fapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function fapiV1PublicGetTicker(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "ticker", ["fapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function fapiV1PublicGetKlines(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "klines", ["fapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivateGetMyTrades(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "myTrades", ["fapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivateGetOpenOrders(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "openOrders", ["fapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivateGetOrder(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "order", ["fapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivateGetAccount(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "account", ["fapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivateGetLeverageBracket(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "leverageBracket", ["fapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivateGetCommissionRate(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "commissionRate", ["fapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivateGetFuturesTransferHistory(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "futures_transfer_history", ["fapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivateGetForceOrdersHistory(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "forceOrdersHistory", ["fapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function fapiV2PrivatePostPositionMargin(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "positionMargin", ["fapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function fapiV2PrivatePostLevelEdit(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "level_edit", ["fapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function fapiV2PrivatePostCancel(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "cancel", ["fapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function fapiV2PrivatePostOrder(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "order", ["fapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function fapiV2PrivatePostAllOpenOrders(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "allOpenOrders", ["fapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function fapiV2PrivatePostFuturesTransfer(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "futures_transfer", ["fapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function dapiV1PublicGetPing(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "ping", ["dapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function dapiV1PublicGetTime(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "time", ["dapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function dapiV1PublicGetContracts(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "contracts", ["dapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function dapiV1PublicGetDepth(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "depth", ["dapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function dapiV1PublicGetTicker(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "ticker", ["dapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function dapiV1PublicGetKlines(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "klines", ["dapi", "v1", "public"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivateGetMyTrades(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "myTrades", ["dapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivateGetOpenOrders(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "openOrders", ["dapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivateGetOrder(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "order", ["dapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivateGetAccount(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "account", ["dapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivateGetLeverageBracket(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "leverageBracket", ["dapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivateGetCommissionRate(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "commissionRate", ["dapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivateGetFuturesTransferHistory(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "futures_transfer_history", ["dapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivateGetForceOrdersHistory(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "forceOrdersHistory", ["dapi", "v2", "private"], "GET", params, nothing, nothing, Dict())
end

function dapiV2PrivatePostPositionMargin(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "positionMargin", ["dapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function dapiV2PrivatePostLevelEdit(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "level_edit", ["dapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function dapiV2PrivatePostCancel(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "cancel", ["dapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function dapiV2PrivatePostOrder(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "order", ["dapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function dapiV2PrivatePostAllOpenOrders(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "allOpenOrders", ["dapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function dapiV2PrivatePostFuturesTransfer(self::Bitrue, params=Dict(), context=Dict())
    return request(self, "futures_transfer", ["dapi", "v2", "private"], "POST", params, nothing, nothing, Dict())
end

function Bitrue(; kwargs...)
    inst = Bitrue(Exchange(), describe, nonce, fetchStatus, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchOHLCV, parseOHLCV, fetchBidsAsks, fetchTickers, parseTrade, fetchTrades, parseOrderStatus, parseOrder, createMarketBuyOrderWithCost, createOrder, fetchOrder, fetchClosedOrders, fetchOpenOrders, cancelOrder, cancelAllOrders, fetchMyTrades, fetchDeposits, fetchWithdrawals, parseTransactionStatusByType, parseTransaction, withdraw, parseDepositWithdrawFee, fetchDepositWithdrawFees, parseTransfer, fetchTransfers, transfer, setLeverage, parseMarginModification, setMargin, sign, handleErrors, calculateRateLimiterCost, spotKlinePublicGetPublicJson, spotKlinePublicGetPublicCurrencyJson, spotV1PublicGetPing, spotV1PublicGetTime, spotV1PublicGetExchangeInfo, spotV1PublicGetDepth, spotV1PublicGetTrades, spotV1PublicGetHistoricalTrades, spotV1PublicGetAggTrades, spotV1PublicGetTicker24hr, spotV1PublicGetTickerPrice, spotV1PublicGetTickerBookTicker, spotV1PublicGetMarketKline, spotV1PrivateGetOrder, spotV1PrivateGetOpenOrders, spotV1PrivateGetAllOrders, spotV1PrivateGetAccount, spotV1PrivateGetMyTrades, spotV1PrivateGetEtfNetValueSymbol, spotV1PrivateGetWithdrawHistory, spotV1PrivateGetDepositHistory, spotV1PrivatePostOrder, spotV1PrivatePostWithdrawCommit, spotV1PrivateDeleteOrder, spotV2PrivateGetMyTrades, fapiV1PublicGetPing, fapiV1PublicGetTime, fapiV1PublicGetContracts, fapiV1PublicGetDepth, fapiV1PublicGetTicker, fapiV1PublicGetKlines, fapiV2PrivateGetMyTrades, fapiV2PrivateGetOpenOrders, fapiV2PrivateGetOrder, fapiV2PrivateGetAccount, fapiV2PrivateGetLeverageBracket, fapiV2PrivateGetCommissionRate, fapiV2PrivateGetFuturesTransferHistory, fapiV2PrivateGetForceOrdersHistory, fapiV2PrivatePostPositionMargin, fapiV2PrivatePostLevelEdit, fapiV2PrivatePostCancel, fapiV2PrivatePostOrder, fapiV2PrivatePostAllOpenOrders, fapiV2PrivatePostFuturesTransfer, dapiV1PublicGetPing, dapiV1PublicGetTime, dapiV1PublicGetContracts, dapiV1PublicGetDepth, dapiV1PublicGetTicker, dapiV1PublicGetKlines, dapiV2PrivateGetMyTrades, dapiV2PrivateGetOpenOrders, dapiV2PrivateGetOrder, dapiV2PrivateGetAccount, dapiV2PrivateGetLeverageBracket, dapiV2PrivateGetCommissionRate, dapiV2PrivateGetFuturesTransferHistory, dapiV2PrivateGetForceOrdersHistory, dapiV2PrivatePostPositionMargin, dapiV2PrivatePostLevelEdit, dapiV2PrivatePostCancel, dapiV2PrivatePostOrder, dapiV2PrivatePostAllOpenOrders, dapiV2PrivatePostFuturesTransfer)
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
