@kwdef mutable struct Bydfi <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchOrderBook::Function = fetchOrderBook
    getClosestLimit::Function = getClosestLimit
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    parseTradeType::Function = parseTradeType
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    createOrder::Function = createOrder
    createOrderRequest::Function = createOrderRequest
    encodeWorkingType::Function = encodeWorkingType
    createOrders::Function = createOrders
    editOrder::Function = editOrder
    editOrders::Function = editOrders
    createEditOrderRequest::Function = createEditOrderRequest
    cancelAllOrders::Function = cancelAllOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOpenOrder::Function = fetchOpenOrder
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    handleSinceAndUntil::Function = handleSinceAndUntil
    parseOrder::Function = parseOrder
    parseOrderType::Function = parseOrderType
    parseOrderTimeInForce::Function = parseOrderTimeInForce
    parseOrderStatus::Function = parseOrderStatus
    setLeverage::Function = setLeverage
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    fetchPositions::Function = fetchPositions
    fetchPositionsForSymbol::Function = fetchPositionsForSymbol
    parsePosition::Function = parsePosition
    parsePositionSide::Function = parsePositionSide
    fetchPositionHistory::Function = fetchPositionHistory
    fetchPositionsHistory::Function = fetchPositionsHistory
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    setMarginMode::Function = setMarginMode
    setPositionMode::Function = setPositionMode
    fetchPositionMode::Function = fetchPositionMode
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    parseTransfer::Function = parseTransfer
    paraseTransferStatus::Function = paraseTransferStatus
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchTransactionsHelper::Function = fetchTransactionsHelper
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetV1PublicApiLimits::Function = publicGetV1PublicApiLimits
    publicGetV1FapiMarketExchangeInfo::Function = publicGetV1FapiMarketExchangeInfo
    publicGetV1FapiMarketDepth::Function = publicGetV1FapiMarketDepth
    publicGetV1FapiMarketTrades::Function = publicGetV1FapiMarketTrades
    publicGetV1FapiMarketKlines::Function = publicGetV1FapiMarketKlines
    publicGetV1FapiMarketTicker24hr::Function = publicGetV1FapiMarketTicker24hr
    publicGetV1FapiMarketTickerPrice::Function = publicGetV1FapiMarketTickerPrice
    publicGetV1FapiMarketMarkPrice::Function = publicGetV1FapiMarketMarkPrice
    publicGetV1FapiMarketFundingRate::Function = publicGetV1FapiMarketFundingRate
    publicGetV1FapiMarketFundingRateHistory::Function = publicGetV1FapiMarketFundingRateHistory
    publicGetV1FapiMarketRiskLimit::Function = publicGetV1FapiMarketRiskLimit
    privateGetV1AccountAssets::Function = privateGetV1AccountAssets
    privateGetV1AccountTransferRecords::Function = privateGetV1AccountTransferRecords
    privateGetV1SpotDepositRecords::Function = privateGetV1SpotDepositRecords
    privateGetV1SpotWithdrawRecords::Function = privateGetV1SpotWithdrawRecords
    privateGetV1FapiTradeOpenOrder::Function = privateGetV1FapiTradeOpenOrder
    privateGetV1FapiTradePlanOrder::Function = privateGetV1FapiTradePlanOrder
    privateGetV1FapiTradeLeverage::Function = privateGetV1FapiTradeLeverage
    privateGetV1FapiTradeHistoryOrder::Function = privateGetV1FapiTradeHistoryOrder
    privateGetV1FapiTradeHistoryTrade::Function = privateGetV1FapiTradeHistoryTrade
    privateGetV1FapiTradePositionHistory::Function = privateGetV1FapiTradePositionHistory
    privateGetV1FapiTradePositions::Function = privateGetV1FapiTradePositions
    privateGetV1FapiAccountBalance::Function = privateGetV1FapiAccountBalance
    privateGetV1FapiUserDataAssetsMargin::Function = privateGetV1FapiUserDataAssetsMargin
    privateGetV1FapiUserDataPositionSideDual::Function = privateGetV1FapiUserDataPositionSideDual
    privateGetV1AgentTeams::Function = privateGetV1AgentTeams
    privateGetV1AgentAgentLinks::Function = privateGetV1AgentAgentLinks
    privateGetV1AgentRegularOverview::Function = privateGetV1AgentRegularOverview
    privateGetV1AgentAgentSubOverview::Function = privateGetV1AgentAgentSubOverview
    privateGetV1AgentPartenerUserDeposit::Function = privateGetV1AgentPartenerUserDeposit
    privateGetV1AgentPartenerUsersData::Function = privateGetV1AgentPartenerUsersData
    privateGetV1AgentAffiliateUids::Function = privateGetV1AgentAffiliateUids
    privateGetV1AgentAffiliateCommission::Function = privateGetV1AgentAffiliateCommission
    privateGetV1AgentInternalWithdrawalStatus::Function = privateGetV1AgentInternalWithdrawalStatus
    privatePostV1AccountTransfer::Function = privatePostV1AccountTransfer
    privatePostV1FapiTradePlaceOrder::Function = privatePostV1FapiTradePlaceOrder
    privatePostV1FapiTradeBatchPlaceOrder::Function = privatePostV1FapiTradeBatchPlaceOrder
    privatePostV1FapiTradeEditOrder::Function = privatePostV1FapiTradeEditOrder
    privatePostV1FapiTradeBatchEditOrder::Function = privatePostV1FapiTradeBatchEditOrder
    privatePostV1FapiTradeCancelAllOrder::Function = privatePostV1FapiTradeCancelAllOrder
    privatePostV1FapiTradeLeverage::Function = privatePostV1FapiTradeLeverage
    privatePostV1FapiTradeBatchLeverageMargin::Function = privatePostV1FapiTradeBatchLeverageMargin
    privatePostV1FapiUserDataMarginType::Function = privatePostV1FapiUserDataMarginType
    privatePostV1FapiUserDataPositionSideDual::Function = privatePostV1FapiUserDataPositionSideDual
    privatePostV1AgentInternalWithdrawal::Function = privatePostV1AgentInternalWithdrawal

end
function describe(self::Bydfi, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bydfi",
    Symbol("name") => "BYDFi",
    Symbol("countries") => ["SG"],
    Symbol("rateLimit") => 50,
    Symbol("version") => "v1",
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => false,
        Symbol("cancelOrders") => false,
        Symbol("cancelOrdersWithClientOrderId") => false,
        Symbol("cancelOrderWithClientOrderId") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createLimitBuyOrder") => false,
        Symbol("createLimitOrder") => true,
        Symbol("createLimitSellOrder") => false,
        Symbol("createMarketBuyOrder") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrder") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("createTriggerOrder") => false,
        Symbol("deposit") => false,
        Symbol("editOrder") => true,
        Symbol("editOrders") => true,
        Symbol("editOrderWithClientOrderId") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => false,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => false,
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchL2OrderBook") => true,
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLastPrices") => false,
        Symbol("fetchLedger") => false,
        Symbol("fetchLedgerEntry") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => true,
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
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => false,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrdersByStatus") => false,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchOrderWithClientOrderId") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => true,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsForSymbol") => true,
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
        Symbol("fetchTransfers") => true,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawAddresses") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("watchMyLiquidationsForSymbols") => false,
        Symbol("withdraw") => false,
        Symbol("ws") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/0e9319dc-b5f5-458b-bcfd-b21b50e162ea",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.bydfi.com/api",
            Symbol("private") => "https://api.bydfi.com/api"
        ),
        Symbol("www") => "https://bydfi.com/",
        Symbol("doc") => "https://developers.bydfi.com/en/",
        Symbol("referral") => "https://partner.bydfi.com/j/DilWutCI"
    ),
    Symbol("fees") => Dict{Symbol, Any}(),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/public/api_limits") => 1,
                Symbol("v1/fapi/market/exchange_info") => 1,
                Symbol("v1/fapi/market/depth") => 1,
                Symbol("v1/fapi/market/trades") => 1,
                Symbol("v1/fapi/market/klines") => 1,
                Symbol("v1/fapi/market/ticker/24hr") => 1,
                Symbol("v1/fapi/market/ticker/price") => 1,
                Symbol("v1/fapi/market/mark_price") => 1,
                Symbol("v1/fapi/market/funding_rate") => 1,
                Symbol("v1/fapi/market/funding_rate_history") => 1,
                Symbol("v1/fapi/market/risk_limit") => 1
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v1/account/assets") => 1,
                Symbol("v1/account/transfer_records") => 1,
                Symbol("v1/spot/deposit_records") => 1,
                Symbol("v1/spot/withdraw_records") => 1,
                Symbol("v1/fapi/trade/open_order") => 1,
                Symbol("v1/fapi/trade/plan_order") => 1,
                Symbol("v1/fapi/trade/leverage") => 1,
                Symbol("v1/fapi/trade/history_order") => 1,
                Symbol("v1/fapi/trade/history_trade") => 1,
                Symbol("v1/fapi/trade/position_history") => 1,
                Symbol("v1/fapi/trade/positions") => 1,
                Symbol("v1/fapi/account/balance") => 1,
                Symbol("v1/fapi/user_data/assets_margin") => 1,
                Symbol("v1/fapi/user_data/position_side/dual") => 1,
                Symbol("v1/agent/teams") => 1,
                Symbol("v1/agent/agent_links") => 1,
                Symbol("v1/agent/regular_overview") => 1,
                Symbol("v1/agent/agent_sub_overview") => 1,
                Symbol("v1/agent/partener_user_deposit") => 1,
                Symbol("v1/agent/partener_users_data") => 1,
                Symbol("v1/agent/affiliate_uids") => 1,
                Symbol("v1/agent/affiliate_commission") => 1,
                Symbol("v1/agent/internal_withdrawal_status") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("v1/account/transfer") => 1,
                Symbol("v1/fapi/trade/place_order") => 1,
                Symbol("v1/fapi/trade/batch_place_order") => 1,
                Symbol("v1/fapi/trade/edit_order") => 1,
                Symbol("v1/fapi/trade/batch_edit_order") => 1,
                Symbol("v1/fapi/trade/cancel_all_order") => 1,
                Symbol("v1/fapi/trade/leverage") => 1,
                Symbol("v1/fapi/trade/batch_leverage_margin") => 1,
                Symbol("v1/fapi/user_data/margin_type") => 1,
                Symbol("v1/fapi/user_data/position_side/dual") => 1,
                Symbol("v1/agent/internal_withdrawal") => 1
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => nothing,
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("sandbox") => false,
                Symbol("createOrder") => Dict{Symbol, Any}(
                    Symbol("marginMode") => false,
                    Symbol("triggerPrice") => false,
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("mark") => true,
                        Symbol("last") => true,
                        Symbol("index") => false
                    ),
                    Symbol("stopLossPrice") => true,
                    Symbol("takeProfitPrice") => true,
                    Symbol("attachedStopLossTakeProfit") => nothing,
                    Symbol("timeInForce") => Dict{Symbol, Any}(
                        Symbol("IOC") => true,
                        Symbol("FOK") => true,
                        Symbol("PO") => true,
                        Symbol("GTD") => false
                    ),
                    Symbol("hedged") => true,
                    Symbol("selfTradePrevention") => false,
                    Symbol("trailing") => true,
                    Symbol("iceberg") => false,
                    Symbol("leverage") => false,
                    Symbol("marketBuyRequiresPrice") => false,
                    Symbol("marketBuyByCost") => false
                ),
                Symbol("createOrders") => Dict{Symbol, Any}(
                    Symbol("max") => 5
                ),
                Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                    Symbol("marginMode") => false,
                    Symbol("daysBack") => 182,
                    Symbol("limit") => 500,
                    Symbol("untilDays") => 7,
                    Symbol("symbolRequired") => false
                ),
                Symbol("fetchOrder") => nothing,
                Symbol("fetchOpenOrder") => Dict{Symbol, Any}(
                    Symbol("marginMode") => false,
                    Symbol("trigger") => true,
                    Symbol("trailing") => false,
                    Symbol("symbolRequired") => true
                ),
                Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                    Symbol("marginMode") => false,
                    Symbol("limit") => 500,
                    Symbol("trigger") => true,
                    Symbol("trailing") => false,
                    Symbol("symbolRequired") => true
                ),
                Symbol("fetchOrders") => nothing,
                Symbol("fetchCanceledAndClosedOrders") => Dict{Symbol, Any}(
                    Symbol("marginMode") => false,
                    Symbol("limit") => 500,
                    Symbol("daysBack") => 182,
                    Symbol("untilDays") => 7,
                    Symbol("trigger") => false,
                    Symbol("trailing") => false,
                    Symbol("symbolRequired") => false
                ),
                Symbol("fetchClosedOrders") => nothing,
                Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                    Symbol("limit") => 500
                )
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
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
        Symbol("12h") => "12h",
        Symbol("1d") => "1d"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("101001") => AuthenticationError,
            Symbol("101103") => AuthenticationError,
            Symbol("102001") => BadRequest,
            Symbol("102002") => PermissionDenied,
            Symbol("401") => AuthenticationError,
            Symbol("500") => ExchangeError,
            Symbol("501") => ExchangeError,
            Symbol("506") => ExchangeError,
            Symbol("510") => RateLimitExceeded,
            Symbol("511") => AuthenticationError,
            Symbol("513") => BadRequest,
            Symbol("514") => BadRequest,
            Symbol("600") => BadRequest,
            Symbol("Position does not exist") => BadRequest,
            Symbol("Requires transaction permissions") => PermissionDenied,
            Symbol("Service error") => ExchangeError,
            Symbol("transfer failed") => InsufficientFunds
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("is missing") => ArgumentsRequired
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ETH"
        ),
        Symbol("timeInForce") => Dict{Symbol, Any}(
            Symbol("GTC") => "GTC",
            Symbol("FOK") => "FOK",
            Symbol("IOC") => "IOC",
            Symbol("PO") => "POST_ONLY"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("swap") => "UMFUTURE",
            Symbol("funding") => "FUNDING",
            Symbol("inverse") => "CMFUTURE"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("SPOT") => "spot",
            Symbol("UMFUTURE") => "swap",
            Symbol("FUNDING") => "funding",
            Symbol("CMFUTURE") => "inverse"
        )
    )
))

end
function fetchMarkets(self::Bydfi, params=Dict())
    response = Base.fetch(self.publicGetV1FapiMarketExchangeInfo(params));
    data = self.safeList(response, "data", []);
    return self.parseMarkets(data)

end
function parseMarket(self::Bydfi, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "baseAsset");
    quoteId = safeString(market, "quoteAsset");
    settleId = safeString(market, "marginAsset");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    settle = self.safeCurrencyCode(settleId);
    symbol = string(base, "/", quote_var, ":", settle);
    inverse = self.safeBool(market, "reverse");
    limitMaxQty = safeString(market, "limitMaxQty");
    marketMaxQty = safeString(market, "marketMaxQty");
    maxAmountString = stringMax(limitMaxQty, marketMaxQty);
    marketMinQty = safeString(market, "marketMinQty");
    limitMinQty = safeString(market, "limitMinQty");
    minAmountString = stringMin(marketMinQty, limitMinQty);
    contractSize = safeString(market, "contractFactor");
    pricePrecision = self.parsePrecision(safeString(market, "priceOrderPrecision"));
    rawAmountPrecision = self.parsePrecision(safeString(market, "volumePrecision"));
    amountPrecision = stringDiv(rawAmountPrecision, contractSize);
    basePrecision = self.parsePrecision(safeString(market, "basePrecision"));
    taker = self.safeNumber(market, "feeRateTaker");
    maker = self.safeNumber(market, "feeRateMaker");
    maxLeverage = self.safeNumber(market, "maxLeverageLevel");
    status = safeString(market, "status");
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => nothing,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => status == "NORMAL",
    Symbol("contract") => true,
    Symbol("linear") => !functions.ccxtruthy(inverse),
    Symbol("inverse") => inverse,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
    Symbol("contractSize") => self.parseNumber(contractSize),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(amountPrecision),
        Symbol("price") => self.parseNumber(pricePrecision),
        Symbol("base") => self.parseNumber(basePrecision)
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => maxLeverage
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minAmountString),
            Symbol("max") => self.parseNumber(maxAmountString)
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
    Symbol("created") => self.parse8601(safeString(market, "createdAt")),
    Symbol("info") => market
))

end
function fetchOrderBook(self::Bydfi, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = self.getClosestLimit(limit);
    end
    response = Base.fetch(self.publicGetV1FapiMarketDepth(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    timestamp = milliseconds();
    orderBook = self.parseOrderBook(data, get(market, Symbol("symbol"), nothing), timestamp, "bids", "asks", "price", "amount");
    orderBook[Symbol("nonce")] = safeInteger(data, "lastUpdateId");
    return orderBook

end
function getClosestLimit(self::Bydfi, limit)
    limits = [5, 10, 20, 50, 100, 500, 1000];
    result = 1000;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(limits)))
        if functions.ccxtruthy(functions.ccxt_le(limit, get(limits, i + 1, nothing)))
            result = get(limits, i + 1, nothing);
            break
        end
        i += 1
    end
    return result

end
function fetchTrades(self::Bydfi, symbol, since=nothing, limit=nothing, params=Dict())
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
    response = Base.fetch(self.publicGetV1FapiMarketTrades(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function fetchMyTrades(self::Bydfi, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = self.safeBool(params, "paginate", false);
    if functions.ccxtruthy(paginate)
        maxLimit = 500;
        params = omit(params, "paginate");
        params = extend(params, Dict{Symbol, Any}(
    Symbol("paginationDirection") => "backward"
));
        paginatedResponse = Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol, since, limit, params, maxLimit, true));
            return sortBy(paginatedResponse, "timestamp")
    end
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchMyTrades", "contractType", contractType);
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    params = self.handleSinceAndUntil("fetchMyTrades", since, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetV1FapiTradeHistoryTrade(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function parseTrade(self::Bydfi, trade, market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger(trade, "time");
    fee = nothing;
    rawType = safeString(trade, "type");
    feeCost = safeString(trade, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => get(market, Symbol("settle"), nothing)
        );
    end
    orderId = safeString(trade, "orderId");
    side = nothing;
    if functions.ccxtruthy(orderId == nothing)
        side = safeStringLower(trade, "side");
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => safeString(trade, "id"),
    Symbol("order") => orderId,
    Symbol("type") => self.parseTradeType(rawType),
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => safeString2(trade, "price", "dealPrice"),
    Symbol("amount") => safeString2(trade, "quantity", "dealVolume"),
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function parseTradeType(self::Bydfi, type_var)
    types = Dict{Symbol, Any}(
        Symbol("1") => "limit",
        Symbol("2") => "market",
        Symbol("3") => "liquidation"
    );
    return safeString(types, type_var, type_var)

end
function fetchOHLCV(self::Bydfi, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 500;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, maxLimit)
    end
    market = self.market(symbol);
    interval = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => interval
    );
    startTime = since;
    numberOfCandles = functions.ccxtruthy(limit) ? limit : maxLimit;
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchOHLCV", "until");
    now = milliseconds();
    duration = self.parseTimeframe(timeframe) * 1000;
    timeDelta = duration * numberOfCandles;
    if functions.ccxtruthy(@functions.ccxt_and(startTime == nothing, until == nothing))
        startTime = now - timeDelta;
        until = now;
    elseif functions.ccxtruthy(until == nothing)
        until = startTime + timeDelta;
        if functions.ccxtruthy(functions.ccxt_gt(until, now))
            until = now;
        end
    else
        if functions.ccxtruthy(startTime == nothing)
            startTime = until - timeDelta;
        end

    end
    request[Symbol("startTime")] = startTime;
    request[Symbol("endTime")] = until;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetV1FapiMarketKlines(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = self.parseOHLCVs(data, market, timeframe, since, limit);
    return result

end
function parseOHLCV(self::Bydfi, ohlcv, market=nothing)
    return [safeInteger(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber(ohlcv, "v")]

end
function fetchTickers(self::Bydfi, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetV1FapiMarketTicker24hr(params));
    data = self.safeList(response, "data", []);
    return self.parseTickers(data, symbols)

end
function fetchTicker(self::Bydfi, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1FapiMarketTicker24hr(extend(request, params)));
    data = self.safeList(response, "data", []);
    ticker = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTicker(ticker, market)

end
function parseTicker(self::Bydfi, ticker, market=nothing)
    marketId = safeString2(ticker, "symbol", "s");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger2(ticker, "time", "E");
    last_var = safeString2(ticker, "last", "c");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(ticker, "high", "h"),
    Symbol("low") => safeString2(ticker, "low", "l"),
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString2(ticker, "open", "o"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString2(ticker, "vol", "v"),
    Symbol("quoteVolume") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("info") => ticker
), market)

end
function fetchFundingRate(self::Bydfi, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV1FapiMarketFundingRate(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseFundingRate(data, market)

end
function parseFundingRate(self::Bydfi, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market);
    timestamp = safeInteger(contract, "time");
    nextFundingTimestamp = safeInteger(contract, "nextFundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(contract, "lastFundingRate"),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function fetchFundingRateHistory(self::Bydfi, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.publicGetV1FapiMarketFundingRateHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseFundingRateHistories(data, market, since, limit)

end
function parseFundingRateHistory(self::Bydfi, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    timestamp = safeInteger(contract, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function createOrder(self::Bydfi, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "createOrder", "wallet", wallet);
    orderRequest = extend(orderRequest, Dict{Symbol, Any}(
    Symbol("wallet") => wallet
));
    response = Base.fetch(self.privatePostV1FapiTradePlaceOrder(orderRequest));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function createOrderRequest(self::Bydfi, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side)
    );
    stopLossPrice = safeString(params, "stopLossPrice");
    isStopLossOrder = (stopLossPrice != nothing);
    takeProfitPrice = safeString(params, "takeProfitPrice");
    isTakeProfitOrder = (takeProfitPrice != nothing);
    trailingPercent = safeString(params, "trailingPercent");
    isTailingStopOrder = (trailingPercent != nothing);
    stopPrice = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder))
        stopPrice = functions.ccxtruthy(isStopLossOrder) ? stopLossPrice : takeProfitPrice;
        params = omit(params, ["stopLossPrice", "takeProfitPrice"]);
        request[Symbol("stopPrice")] = self.priceToPrecision(symbol, stopPrice);
    elseif functions.ccxtruthy(isTailingStopOrder)
        params = omit(params, ["trailingPercent"]);
        request[Symbol("callbackRate")] = trailingPercent;
        trailingTriggerPrice = numberToString(price);
        (trailingTriggerPrice, params) = self.handleParamString(params, "trailingTriggerPrice", trailingTriggerPrice);
        if functions.ccxtruthy(trailingTriggerPrice != nothing)
            request[Symbol("activationPrice")] = self.priceToPrecision(symbol, trailingTriggerPrice);
            params = omit(params, ["trailingTriggerPrice"]);
        end
    end
    type_var = uppercase(type_var);
    isMarketOrder = (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((type_var == "MARKET"), (type_var == "STOP_MARKET")), (type_var == "TAKE_PROFIT_MARKET")), (type_var == "TRAILING_STOP_MARKET")));
    if functions.ccxtruthy(isMarketOrder)
        if functions.ccxtruthy(type_var == "MARKET")
            if functions.ccxtruthy(isStopLossOrder)
                type_var = "STOP_MARKET";
            elseif functions.ccxtruthy(isTakeProfitOrder)
                type_var = "TAKE_PROFIT_MARKET";
            else
                if functions.ccxtruthy(isTailingStopOrder)
                    type_var = "TRAILING_STOP_MARKET";
                end

            end
        end
    else
        if functions.ccxtruthy(price == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for a ", type_var, " order")));
        end
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        if functions.ccxtruthy(isStopLossOrder)
            type_var = "STOP";
        elseif functions.ccxtruthy(isTakeProfitOrder)
            type_var = "TAKE_PROFIT";
        end
    end
    request[Symbol("type")] = type_var;
    hedged = false;
    (hedged, params) = self.handleOptionAndParams(params, "createOrder", "hedged", hedged);
    reduceOnly = self.safeBool(params, "reduceOnly", false);
    if functions.ccxtruthy(hedged)
        params = omit(params, "reduceOnly");
        if functions.ccxtruthy(side == "buy")
            request[Symbol("positionSide")] = functions.ccxtruthy(reduceOnly) ? "SHORT" : "LONG";
        elseif functions.ccxtruthy(side == "sell")
            request[Symbol("positionSide")] = functions.ccxtruthy(reduceOnly) ? "LONG" : "SHORT";
        end
    end
    closePosition = self.safeBool(params, "closePosition", false);
    if functions.ccxtruthy(!functions.ccxtruthy(closePosition))
        params = omit(params, "closePosition");
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    elseif functions.ccxtruthy(@functions.ccxt_and((type_var != "STOP_MARKET"), (type_var != "TAKE_PROFIT_MARKET")))
        throw(NotSupported(string(self.id, " createOrder() closePosition is only supported for stopLoss and takeProfit market orders")));
    end
    timeInForce = self.handleTimeInForce(params);
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(isMarketOrder, timeInForce == "POST_ONLY", params);
    if functions.ccxtruthy(postOnly)
        timeInForce = "POST_ONLY";
    end
    if functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("timeInForce")] = timeInForce;
        params = omit(params, "timeInForce");
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder), isTailingStopOrder))
        workingType = "CONTRACT_PRICE";
        (workingType, params) = self.handleOptionAndParams(params, "createOrder", "triggerPriceType", workingType);
        request[Symbol("workingType")] = self.encodeWorkingType(workingType);
    end
    return extend(request, params)

end
function encodeWorkingType(self::Bydfi, workingType)
    types = Dict{Symbol, Any}(
        Symbol("markPrice") => "MARK_PRICE",
        Symbol("mark") => "MARK_PRICE",
        Symbol("contractPrice") => "CONTRACT_PRICE",
        Symbol("contract") => "CONTRACT_PRICE",
        Symbol("last") => "CONTRACT_PRICE"
    );
    return safeString(types, workingType, workingType)

end
function createOrders(self::Bydfi, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    len = length(orders);
    if functions.ccxtruthy(functions.ccxt_gt(len, 5))
        throw(BadRequest(string(self.id, " createOrders() accepts a maximum of 5 orders")));
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
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price, orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "createOrder", "wallet", wallet);
    request = Dict{Symbol, Any}(
        Symbol("wallet") => wallet,
        Symbol("orders") => ordersRequests
    );
    response = Base.fetch(self.privatePostV1FapiTradeBatchPlaceOrder(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data)

end
function editOrder(self::Bydfi, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = self.createEditOrderRequest(id, symbol, "limit", side, amount, price, params);
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "editOrder", "wallet", wallet);
    request[Symbol("wallet")] = wallet;
    response = Base.fetch(self.privatePostV1FapiTradeEditOrder(request));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data)

end
function editOrders(self::Bydfi, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    len = length(orders);
    if functions.ccxtruthy(functions.ccxt_gt(len, 5))
        throw(BadRequest(string(self.id, " editOrders() accepts a maximum of 5 orders")));
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        id = safeString(rawOrder, "id");
        symbol = safeString(rawOrder, "symbol");
        side = safeString(rawOrder, "side");
        amount = self.safeNumber(rawOrder, "amount");
        price = self.safeNumber(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.createEditOrderRequest(id, symbol, "limit", side, amount, price, orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "editOrder", "wallet", wallet);
    request = Dict{Symbol, Any}(
        Symbol("wallet") => wallet,
        Symbol("editOrders") => ordersRequests
    );
    response = Base.fetch(self.privatePostV1FapiTradeBatchEditOrder(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data)

end
function createEditOrderRequest(self::Bydfi, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    clientOrderId = safeString(params, "clientOrderId");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_and((id == nothing), (clientOrderId == nothing)))
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an id argument or a clientOrderId parameter")));
    elseif functions.ccxtruthy(id != nothing)
        request[Symbol("orderId")] = id;
    end
    market = self.market(symbol);
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    if functions.ccxtruthy(side != nothing)
        request[Symbol("side")] =         uppercase(side);
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    return extend(request, params)

end
function cancelAllOrders(self::Bydfi, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "cancelAllOrders", "wallet", wallet);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("wallet") => wallet
    );
    response = Base.fetch(self.privatePostV1FapiTradeCancelAllOrder(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market)

end
function fetchOpenOrders(self::Bydfi, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "wallet", wallet);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("wallet") => wallet
    );
    trigger = false;
    (trigger, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "trigger", trigger);
    if functions.ccxtruthy(!functions.ccxtruthy(trigger))
        response = Base.fetch(self.privateGetV1FapiTradeOpenOrder(extend(request, params)));
    else
        response = Base.fetch(self.privateGetV1FapiTradePlanOrder(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchOpenOrder(self::Bydfi, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(@functions.ccxt_and((id == nothing), (clientOrderId == nothing)))
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrder() requires an id argument or a clientOrderId parameter")));
    elseif functions.ccxtruthy(id != nothing)
        request[Symbol("orderId")] = id;
    end
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "fetchOpenOrder", "wallet", wallet);
    request[Symbol("wallet")] = wallet;
    trigger = false;
    (trigger, params) = self.handleOptionAndParams(params, "fetchOpenOrder", "trigger", trigger);
    if functions.ccxtruthy(!functions.ccxtruthy(trigger))
        response = Base.fetch(self.privateGetV1FapiTradeOpenOrder(extend(request, params)));
    else
        response = Base.fetch(self.privateGetV1FapiTradePlanOrder(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    order = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseOrder(order, market)

end
function fetchCanceledAndClosedOrders(self::Bydfi, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = self.safeBool(params, "paginate", false);
    if functions.ccxtruthy(paginate)
        maxLimit = 500;
        params = omit(params, "paginate");
        params = extend(params, Dict{Symbol, Any}(
    Symbol("paginationDirection") => "backward"
));
        paginatedResponse = Base.fetch(self.fetchPaginatedCallDynamic("fetchCanceledAndClosedOrders", symbol, since, limit, params, maxLimit, true));
            return sortBy(paginatedResponse, "timestamp")
    end
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchCanceledAndClosedOrders", "contractType", contractType);
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    params = self.handleSinceAndUntil("fetchCanceledAndClosedOrders", since, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetV1FapiTradeHistoryOrder(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function handleSinceAndUntil(self::Bydfi, methodName, since=nothing, params=Dict())
    until = nothing;
    (until, params) = self.handleOptionAndParams2(params, methodName, "until", "endTime");
    now = milliseconds();
    sevenDays = 7 * 24 * 60 * 60 * 1000;
    startTime = since;
    if functions.ccxtruthy(startTime == nothing)
        if functions.ccxtruthy(until == nothing)
            startTime = now - sevenDays;
            until = now;
        else
            startTime = until - sevenDays;
        end
    elseif functions.ccxtruthy(until == nothing)
        delta = now - startTime;
        if functions.ccxtruthy(functions.ccxt_gt(delta, sevenDays))
            until = startTime + sevenDays;
        else
            until = now;
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("startTime") => startTime,
        Symbol("endTime") => until
    );
    return extend(request, params)

end
function parseOrder(self::Bydfi, order, market=nothing)
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger2(order, "createTime", "ctime");
    rawType = safeString(order, "orderType");
    stopPrice = safeStringN(order, ["stopPrice", "activatePrice", "triggerPrice"]);
    isStopLossOrder = @functions.ccxt_or(@functions.ccxt_or((rawType == "STOP"), (rawType == "STOP_MARKET")), (rawType == "TRAILING_STOP_MARKET"));
    isTakeProfitOrder = @functions.ccxt_or((rawType == "TAKE_PROFIT"), (rawType == "TAKE_PROFIT_MARKET"));
    rawTimeInForce = safeString(order, "timeInForce");
    timeInForce = self.parseOrderTimeInForce(rawTimeInForce);
    postOnly = nothing;
    if functions.ccxtruthy(timeInForce == "PO")
        postOnly = true;
    end
    rawStatus = safeString(order, "status");
    fee = Dict{Symbol, Any}();
    quoteFee = self.safeNumber(order, "quoteFee");
    if functions.ccxtruthy(quoteFee != nothing)
        fee[Symbol("cost")] = quoteFee;
        fee[Symbol("currency")] = get(market, Symbol("quote"), nothing);
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger2(order, "updateTime", "mtime"),
    Symbol("status") => self.parseOrderStatus(rawStatus),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => self.parseOrderType(rawType),
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => safeStringLower(order, "side"),
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => stopPrice,
    Symbol("stopLossPrice") => functions.ccxtruthy(isStopLossOrder) ? stopPrice : nothing,
    Symbol("takeProfitPrice") => functions.ccxtruthy(isTakeProfitOrder) ? stopPrice : nothing,
    Symbol("amount") => safeString(order, "origQty"),
    Symbol("filled") => safeString(order, "executedQty"),
    Symbol("remaining") => nothing,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => fee,
    Symbol("average") => omitZero(safeString(order, "avgPrice"))
), market)

end
function parseOrderType(self::Bydfi, type_var)
    types = Dict{Symbol, Any}(
        Symbol("LIMIT") => "limit",
        Symbol("MARKET") => "market",
        Symbol("STOP") => "limit",
        Symbol("STOP_MARKET") => "market",
        Symbol("TAKE_PROFIT") => "limit",
        Symbol("TAKE_PROFIT_MARKET") => "market",
        Symbol("TRAILING_STOP_MARKET") => "market"
    );
    return safeString(types, type_var, type_var)

end
function parseOrderTimeInForce(self::Bydfi, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GTC") => "GTC",
        Symbol("FOK") => "FOK",
        Symbol("IOC") => "IOC",
        Symbol("POST_ONLY") => "PO",
        Symbol("TRAILING_STOP") => "IOC"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function parseOrderStatus(self::Bydfi, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("EXPIRED") => "canceled",
        Symbol("PART_FILLED_CANCELLED") => "canceled",
        Symbol("CANCELED") => "canceled",
        Symbol("2") => "closed",
        Symbol("4") => "canceled"
    );
    return safeString(statuses, status, status)

end
function setLeverage(self::Bydfi, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "setLeverage", "wallet", wallet);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage,
        Symbol("wallet") => wallet
    );
    response = Base.fetch(self.privatePostV1FapiTradeLeverage(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return data

end
function fetchLeverage(self::Bydfi, symbol, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "fetchLeverage", "wallet", wallet);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("wallet") => wallet
    );
    response = Base.fetch(self.privateGetV1FapiTradeLeverage(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseLeverage(data, market)

end
function parseLeverage(self::Bydfi, leverage, market=nothing)
    marketId = safeString(leverage, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => nothing,
    Symbol("longLeverage") => safeInteger(leverage, "leverage"),
    Symbol("shortLeverage") => safeInteger(leverage, "leverage")
)

end
function fetchPositions(self::Bydfi, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchPositions", "contractType", contractType);
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType
    );
    response = Base.fetch(self.privateGetV1FapiTradePositions(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parsePositions(data, symbols)

end
function fetchPositionsForSymbol(self::Bydfi, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchPositions", "contractType", contractType);
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetV1FapiTradePositions(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parsePositions(data, [get(market, Symbol("symbol"), nothing)])

end
function parsePosition(self::Bydfi, position, market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market);
    buyOrSell = safeString(position, "side");
    rawPositionSide = safeStringLower(position, "positionSide");
    positionSide = self.parsePositionSide(buyOrSell);
    hedged = nothing;
    isFetchPositionsHistory = false;
    if functions.ccxtruthy(rawPositionSide != nothing)
        isFetchPositionsHistory = true;
        if functions.ccxtruthy(rawPositionSide != "both")
            positionSide = rawPositionSide;
            hedged = true;
        else
            hedged = false;
        end
    end
    contractSize = safeString(market, "contractSize");
    contracts = safeString2(position, "volume", "openPositionVolume");
    if functions.ccxtruthy(!functions.ccxtruthy(isFetchPositionsHistory))
        contracts = stringDiv(contracts, contractSize);
    end
    timestamp = safeInteger(position, "createTime");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "id"),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("entryPrice") => self.parseNumber(safeString2(position, "avgOpenPositionPrice", "avgPrice")),
    Symbol("markPrice") => self.parseNumber(safeString(position, "markPrice")),
    Symbol("lastPrice") => self.parseNumber(safeString(position, "avgClosePositionPrice")),
    Symbol("notional") => self.parseNumber(safeString(position, "closePositionCost")),
    Symbol("collateral") => nothing,
    Symbol("unrealizedPnl") => self.parseNumber(safeString(position, "unPnl")),
    Symbol("realizedPnl") => self.parseNumber(safeString(position, "positionProfits")),
    Symbol("side") => positionSide,
    Symbol("contracts") => self.parseNumber(contracts),
    Symbol("contractSize") => self.parseNumber(contractSize),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger(position, "updateTime"),
    Symbol("hedged") => hedged,
    Symbol("maintenanceMargin") => self.parseNumber(safeString(position, "mm")),
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => self.parseNumber(safeString(position, "im")),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => self.parseNumber(safeString(position, "leverage")),
    Symbol("liquidationPrice") => self.parseNumber(safeString(position, "liqPrice")),
    Symbol("marginRatio") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing
))

end
function parsePositionSide(self::Bydfi, side)
    sides = Dict{Symbol, Any}(
        Symbol("BUY") => "long",
        Symbol("SELL") => "short"
    );
    return safeString(sides, side, side)

end
function fetchPositionHistory(self::Bydfi, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchPositionsHistory", "contractType", contractType);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("contractType") => contractType
    );
    params = self.handleSinceAndUntil("fetchPositionsHistory", since, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetV1FapiTradePositionHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    positions = self.parsePositions(data);
    return self.filterBySinceLimit(positions, since, limit)

end
function fetchPositionsHistory(self::Bydfi, symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchPositionsHistory", "contractType", contractType);
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType
    );
    params = self.handleSinceAndUntil("fetchPositionsHistory", since, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetV1FapiTradePositionHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    positions = self.parsePositions(data, symbols);
    return self.filterBySinceLimit(positions, since, limit)

end
function fetchMarginMode(self::Bydfi, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchMarginMode", "contractType", contractType);
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "fetchMarginMode", "wallet", wallet);
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("wallet") => wallet
    );
    response = Base.fetch(self.privateGetV1FapiUserDataAssetsMargin(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseMarginMode(data, market)

end
function parseMarginMode(self::Bydfi, marginMode, market=nothing)
    marketId = safeString(marginMode, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => safeStringLower(marginMode, "marginType")
)

end
function setMarginMode(self::Bydfi, marginMode, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    marginMode = lowercase(marginMode);
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != "isolated", marginMode != "cross"))
        throw(BadRequest(string(self.id, " setMarginMode() marginMode argument should be isolated or cross")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchMarginMode", "contractType", contractType);
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "fetchMarginMode", "wallet", wallet);
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginType") => uppercase(marginMode),
        Symbol("wallet") => wallet
    );
    return Base.fetch(self.privatePostV1FapiUserDataMarginType(extend(request, params)))

end
function setPositionMode(self::Bydfi, hedged, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol != nothing)
        throw(NotSupported(string(self.id, " setPositionMode() does not support a symbol argument. The position mode is set identically for all markets with same settle currency")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    positionType = functions.ccxtruthy(hedged) ? "HEDGE" : "ONEWAY";
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "setPositionMode", "wallet", wallet);
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "setPositionMode", "contractType", contractType);
    settleCoin = "USDT";
    (settleCoin, params) = self.handleOptionAndParams(params, "setPositionMode", "settleCoin", settleCoin);
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType,
        Symbol("wallet") => wallet,
        Symbol("positionType") => positionType,
        Symbol("settleCoin") => settleCoin
    );
    return Base.fetch(self.privatePostV1FapiUserDataPositionSideDual(extend(request, params)))

end
function fetchPositionMode(self::Bydfi, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    wallet = "W001";
    (wallet, params) = self.handleOptionAndParams(params, "fetchPositionMode", "wallet", wallet);
    contractType = "FUTURE";
    (contractType, params) = self.handleOptionAndParams(params, "fetchPositionMode", "contractType", contractType);
    settleCoin = "USDT";
    if functions.ccxtruthy(symbol == nothing)
        (settleCoin, params) = self.handleOptionAndParams(params, "fetchPositionMode", "settleCoin", settleCoin);
    else
        market = self.market(symbol);
        settleCoin = get(market, Symbol("settleId"), nothing);
    end
    request = Dict{Symbol, Any}(
        Symbol("contractType") => contractType,
        Symbol("settleCoin") => settleCoin,
        Symbol("wallet") => wallet
    );
    response = Base.fetch(self.privateGetV1FapiUserDataPositionSideDual(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    hedged = safeString(data, "positionType") == "HEDGE";
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("hedged") => hedged
)

end
function fetchBalance(self::Bydfi, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    wallet = nothing;
    (wallet, params) = self.handleOptionAndParams(params, "fetchBalance", "wallet");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(wallet == nothing)
        options = self.safeDict(self.options, "accountsByType", Dict{Symbol, Any}());
        parsedAccountType = safeStringUpper(options, type_var, type_var);
        request[Symbol("walletType")] = parsedAccountType;
        response = Base.fetch(self.privateGetV1AccountAssets(extend(request, params)));
    else
        request[Symbol("wallet")] = wallet;
        response = Base.fetch(self.privateGetV1FapiAccountBalance(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseBalance(data)

end
function parseBalance(self::Bydfi, response)
    timestamp = milliseconds();
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        symbol = safeString(balance, "asset");
        code = self.safeCurrencyCode(symbol);
        account = self.account();
        account[Symbol("total")] = safeString2(balance, "total", "balance");
        account[Symbol("free")] = safeString2(balance, "available", "availableBalance");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function transfer(self::Bydfi, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = self.safeDict(self.options, "accountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("fromType") => fromId,
        Symbol("toType") => toId
    );
    response = Base.fetch(self.privatePostV1AccountTransfer(extend(request, params)));
    transfer = self.parseTransfer(response, currency);
    transferOptions = self.safeDict(self.options, "transfer", Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(transferOptions, "fillResponseFromRequest", true);
    if functions.ccxtruthy(fillResponseFromRequest)
        timestamp = milliseconds();
        transfer[Symbol("timestamp")] = timestamp;
        transfer[Symbol("datetime")] = self.iso8601(timestamp);
        transfer[Symbol("currency")] = code;
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
        transfer[Symbol("amount")] = amount;
    end
    return transfer

end
function fetchTransfers(self::Bydfi, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    paginate = self.safeBool(params, "paginate", false);
    if functions.ccxtruthy(paginate)
        maxLimit = 50;
        params = omit(params, "paginate");
        params = extend(params, Dict{Symbol, Any}(
    Symbol("paginationDirection") => "backward"
));
        paginatedResponse = Base.fetch(self.fetchPaginatedCallDynamic("fetchTransfers", get(currency, Symbol("code"), nothing), since, limit, params, maxLimit, true));
            return sortBy(paginatedResponse, "timestamp")
    end
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    until = nothing;
    (until, params) = self.handleOptionAndParams2(params, "fetchTransfers", "until", "endTime");
    if functions.ccxtruthy(until == nothing)
        until = milliseconds();
    end
    if functions.ccxtruthy(since == nothing)
        since = 1;
    end
    request[Symbol("startTime")] = since;
    request[Symbol("endTime")] = until;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("rows")] = limit;
    end
    response = Base.fetch(self.privateGetV1AccountTransferRecords(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransfers(data, currency, since, limit)

end
function parseTransfer(self::Bydfi, transfer, currency=nothing)
    status = safeStringUpper2(transfer, "message", "status");
    accountsById = self.safeDict(self.options, "accountsById", Dict{Symbol, Any}());
    fromId = safeStringUpper(transfer, "sourceWallet");
    toId = safeStringUpper(transfer, "targetWallet");
    fromAccount = safeString(accountsById, fromId, fromId);
    toAccount = safeString(accountsById, toId, toId);
    timestamp = safeInteger(transfer, "timestamp");
    currencyId = safeString(transfer, "asset");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "txId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => self.paraseTransferStatus(status)
)

end
function paraseTransferStatus(self::Bydfi, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SUCCESS") => "ok",
        Symbol("WAIT") => "pending",
        Symbol("FAILED") => "failed"
    );
    return safeString(statuses, status, status)

end
function fetchDeposits(self::Bydfi, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsHelper("deposit", code, since, limit, params))

end
function fetchWithdrawals(self::Bydfi, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchTransactionsHelper("withdrawal", code, since, limit, params))

end
function fetchTransactionsHelper(self::Bydfi, type_var, code, since, limit, params)
    methodName = functions.ccxtruthy((type_var == "deposit")) ? "fetchDeposits" : "fetchWithdrawals";
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    paginate = self.safeBool(params, "paginate", false);
    if functions.ccxtruthy(paginate)
        maxLimit = 50;
        params = omit(params, "paginate");
        params = extend(params, Dict{Symbol, Any}(
    Symbol("paginationDirection") => "backward"
));
        paginatedResponse = Base.fetch(self.fetchPaginatedCallDynamic(methodName, get(currency, Symbol("code"), nothing), since, limit, params, maxLimit, true));
            return sortBy(paginatedResponse, "timestamp")
    end
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    until = nothing;
    (until, params) = self.handleOptionAndParams2(params, "fetchTransfers", "until", "endTime");
    now = milliseconds();
    sevenDays = 7 * 24 * 60 * 60 * 1000;
    startTime = since;
    if functions.ccxtruthy(startTime == nothing)
        if functions.ccxtruthy(until == nothing)
            startTime = now - sevenDays;
            until = now;
        else
            startTime = until - sevenDays;
        end
    elseif functions.ccxtruthy(until == nothing)
        delta = now - startTime;
        if functions.ccxtruthy(functions.ccxt_gt(delta, sevenDays))
            until = startTime + sevenDays;
        else
            until = now;
        end
    end
    request[Symbol("startTime")] = startTime;
    request[Symbol("endTime")] = until;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(type_var == "deposit")
        response = Base.fetch(self.privateGetV1SpotDepositRecords(extend(request, params)));
    else
        response = Base.fetch(self.privateGetV1SpotWithdrawRecords(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    transactionParams = Dict{Symbol, Any}(
        Symbol("type") => type_var
    );
    params = extend(params, transactionParams);
    return self.parseTransactions(data, currency, since, limit, params)

end
function parseTransaction(self::Bydfi, transaction, currency=nothing)
    currencyId = safeString(transaction, "asset");
    code = self.safeCurrencyCode(currencyId, currency);
    rawStatus = safeStringLower(transaction, "status");
    timestamp = safeInteger(transaction, "createTime");
    fee = nothing;
    feeCost = self.safeNumber(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => nothing
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "orderId"),
    Symbol("txid") => safeString(transaction, "txId"),
    Symbol("type") => nothing,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(safeString(transaction, "network"), code),
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("status") => self.parseTransactionStatus(rawStatus),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => safeString(transaction, "address"),
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("tag") => safeString(transaction, "addressTag"),
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("updated") => safeInteger(transaction, "finishTime"),
    Symbol("comment") => nothing,
    Symbol("fee") => fee,
    Symbol("internal") => false
)

end
function parseTransactionStatus(self::Bydfi, status)
    statuses = Dict{Symbol, Any}(
        Symbol("success") => "ok",
        Symbol("wait") => "pending",
        Symbol("failed") => "failed"
    );
    return safeString(statuses, status, status)

end
function sign(self::Bydfi, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing);
    endpoint = string("/", path);
    query = "";
    sortedParams = keysort(params);
    if functions.ccxtruthy(method == "GET")
        query = self.urlencode(sortedParams);
        if functions.ccxtruthy(length(query) != 0)
            endpoint += string("?", query);
        end
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = string(milliseconds());
        if functions.ccxtruthy(method == "GET")
            payload = string(self.apiKey, timestamp, query);
            signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "hex");
            headers = Dict{Symbol, Any}(
                Symbol("X-API-KEY") => self.apiKey,
                Symbol("X-API-TIMESTAMP") => timestamp,
                Symbol("X-API-SIGNATURE") => signature
            );
        else
            body = json(sortedParams);
            payload = string(self.apiKey, timestamp, body);
            signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "hex");
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "application/json",
                Symbol("X-API-KEY") => self.apiKey,
                Symbol("X-API-TIMESTAMP") => timestamp,
                Symbol("X-API-SIGNATURE") => signature
            );
        end
    end
    url += endpoint;
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bydfi, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    code = safeString(response, "code");
    message = safeString(response, "message");
    if functions.ccxtruthy(code != "200")
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bydfi, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetV1PublicApiLimits(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/public/api_limits", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketExchangeInfo(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/exchange_info", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketDepth(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/depth", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketTrades(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/trades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketKlines(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/klines", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketTicker24hr(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/ticker/24hr", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketTickerPrice(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/ticker/price", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketMarkPrice(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/mark_price", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketFundingRate(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/funding_rate", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketFundingRateHistory(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/funding_rate_history", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV1FapiMarketRiskLimit(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/market/risk_limit", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AccountAssets(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/account/assets", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AccountTransferRecords(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/account/transfer_records", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1SpotDepositRecords(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/spot/deposit_records", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1SpotWithdrawRecords(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/spot/withdraw_records", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiTradeOpenOrder(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/open_order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiTradePlanOrder(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/plan_order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiTradeLeverage(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/leverage", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiTradeHistoryOrder(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/history_order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiTradeHistoryTrade(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/history_trade", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiTradePositionHistory(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/position_history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiTradePositions(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/positions", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiAccountBalance(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/account/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiUserDataAssetsMargin(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/user_data/assets_margin", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1FapiUserDataPositionSideDual(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/user_data/position_side/dual", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentTeams(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/teams", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentAgentLinks(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/agent_links", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentRegularOverview(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/regular_overview", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentAgentSubOverview(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/agent_sub_overview", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentPartenerUserDeposit(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/partener_user_deposit", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentPartenerUsersData(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/partener_users_data", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentAffiliateUids(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/affiliate_uids", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentAffiliateCommission(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/affiliate_commission", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV1AgentInternalWithdrawalStatus(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/internal_withdrawal_status", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1AccountTransfer(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/account/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiTradePlaceOrder(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/place_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiTradeBatchPlaceOrder(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/batch_place_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiTradeEditOrder(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/edit_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiTradeBatchEditOrder(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/batch_edit_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiTradeCancelAllOrder(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/cancel_all_order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiTradeLeverage(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/leverage", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiTradeBatchLeverageMargin(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/trade/batch_leverage_margin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiUserDataMarginType(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/user_data/margin_type", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1FapiUserDataPositionSideDual(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/fapi/user_data/position_side/dual", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV1AgentInternalWithdrawal(self::Bydfi, params=Dict(), context=Dict())
    return request(self, "v1/agent/internal_withdrawal", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Bydfi(; kwargs...)
    inst = Bydfi(Exchange(), describe, fetchMarkets, parseMarket, fetchOrderBook, getClosestLimit, fetchTrades, fetchMyTrades, parseTrade, parseTradeType, fetchOHLCV, parseOHLCV, fetchTickers, fetchTicker, parseTicker, fetchFundingRate, parseFundingRate, fetchFundingRateHistory, parseFundingRateHistory, createOrder, createOrderRequest, encodeWorkingType, createOrders, editOrder, editOrders, createEditOrderRequest, cancelAllOrders, fetchOpenOrders, fetchOpenOrder, fetchCanceledAndClosedOrders, handleSinceAndUntil, parseOrder, parseOrderType, parseOrderTimeInForce, parseOrderStatus, setLeverage, fetchLeverage, parseLeverage, fetchPositions, fetchPositionsForSymbol, parsePosition, parsePositionSide, fetchPositionHistory, fetchPositionsHistory, fetchMarginMode, parseMarginMode, setMarginMode, setPositionMode, fetchPositionMode, fetchBalance, parseBalance, transfer, fetchTransfers, parseTransfer, paraseTransferStatus, fetchDeposits, fetchWithdrawals, fetchTransactionsHelper, parseTransaction, parseTransactionStatus, sign, handleErrors, publicGetV1PublicApiLimits, publicGetV1FapiMarketExchangeInfo, publicGetV1FapiMarketDepth, publicGetV1FapiMarketTrades, publicGetV1FapiMarketKlines, publicGetV1FapiMarketTicker24hr, publicGetV1FapiMarketTickerPrice, publicGetV1FapiMarketMarkPrice, publicGetV1FapiMarketFundingRate, publicGetV1FapiMarketFundingRateHistory, publicGetV1FapiMarketRiskLimit, privateGetV1AccountAssets, privateGetV1AccountTransferRecords, privateGetV1SpotDepositRecords, privateGetV1SpotWithdrawRecords, privateGetV1FapiTradeOpenOrder, privateGetV1FapiTradePlanOrder, privateGetV1FapiTradeLeverage, privateGetV1FapiTradeHistoryOrder, privateGetV1FapiTradeHistoryTrade, privateGetV1FapiTradePositionHistory, privateGetV1FapiTradePositions, privateGetV1FapiAccountBalance, privateGetV1FapiUserDataAssetsMargin, privateGetV1FapiUserDataPositionSideDual, privateGetV1AgentTeams, privateGetV1AgentAgentLinks, privateGetV1AgentRegularOverview, privateGetV1AgentAgentSubOverview, privateGetV1AgentPartenerUserDeposit, privateGetV1AgentPartenerUsersData, privateGetV1AgentAffiliateUids, privateGetV1AgentAffiliateCommission, privateGetV1AgentInternalWithdrawalStatus, privatePostV1AccountTransfer, privatePostV1FapiTradePlaceOrder, privatePostV1FapiTradeBatchPlaceOrder, privatePostV1FapiTradeEditOrder, privatePostV1FapiTradeBatchEditOrder, privatePostV1FapiTradeCancelAllOrder, privatePostV1FapiTradeLeverage, privatePostV1FapiTradeBatchLeverageMargin, privatePostV1FapiUserDataMarginType, privatePostV1FapiUserDataPositionSideDual, privatePostV1AgentInternalWithdrawal)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
