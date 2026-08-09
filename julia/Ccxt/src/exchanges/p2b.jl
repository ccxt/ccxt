@kwdef mutable struct P2b <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchClosedOrders::Function = fetchClosedOrders
    parseOrder::Function = parseOrder
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetMarkets::Function = publicGetMarkets
    publicGetMarket::Function = publicGetMarket
    publicGetTickers::Function = publicGetTickers
    publicGetTicker::Function = publicGetTicker
    publicGetBook::Function = publicGetBook
    publicGetHistory::Function = publicGetHistory
    publicGetDepthResult::Function = publicGetDepthResult
    publicGetMarketKline::Function = publicGetMarketKline
    privatePostAccountBalances::Function = privatePostAccountBalances
    privatePostAccountBalance::Function = privatePostAccountBalance
    privatePostOrderNew::Function = privatePostOrderNew
    privatePostOrderCancel::Function = privatePostOrderCancel
    privatePostOrders::Function = privatePostOrders
    privatePostAccountMarketOrderHistory::Function = privatePostAccountMarketOrderHistory
    privatePostAccountMarketDealHistory::Function = privatePostAccountMarketDealHistory
    privatePostAccountOrder::Function = privatePostAccountOrder
    privatePostAccountOrderHistory::Function = privatePostAccountOrderHistory
    privatePostAccountExecutedHistory::Function = privatePostAccountExecutedHistory

end
function describe(self::P2b, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "p2b",
    Symbol("name") => "p2b",
    Symbol("countries") => ["LT"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v2",
    Symbol("pro") => true,
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
        Symbol("cancelAllOrders") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketOrder") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("fetchAccounts") => false,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositsWithdrawals") => false,
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
        Symbol("fetchLedger") => false,
        Symbol("fetchLedgerEntry") => false,
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
        Symbol("fetchMarkPrice") => false,
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
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => true,
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
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawAddresses") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("signIn") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("1h") => "1h",
        Symbol("1d") => "1d"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("referral") => "https://p2pb2b.com?referral=ee784c53",
        Symbol("logo") => "https://github.com/user-attachments/assets/122f0c86-f3a6-4334-910f-4d8edc865696",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.p2pb2b.com/api/v2/public",
            Symbol("private") => "https://api.p2pb2b.com/api/v2"
        ),
        Symbol("www") => "https://p2pb2b.com/",
        Symbol("doc") => "https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md",
        Symbol("fees") => "https://p2pb2b.com/fee-schedule/"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("markets") => 1,
                Symbol("market") => 1,
                Symbol("tickers") => 1,
                Symbol("ticker") => 1,
                Symbol("book") => 1,
                Symbol("history") => 1,
                Symbol("depth/result") => 1,
                Symbol("market/kline") => 1
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/balances") => 1,
                Symbol("account/balance") => 1,
                Symbol("order/new") => 1,
                Symbol("order/cancel") => 1,
                Symbol("orders") => 1,
                Symbol("account/market_order_history") => 1,
                Symbol("account/market_deal_history") => 1,
                Symbol("account/order") => 1,
                Symbol("account/order_history") => 1,
                Symbol("account/executed_history") => 1
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.2")], [self.parseNumber("1"), self.parseNumber("0.19")], [self.parseNumber("5"), self.parseNumber("0.18")], [self.parseNumber("10"), self.parseNumber("0.17")], [self.parseNumber("25"), self.parseNumber("0.16")], [self.parseNumber("75"), self.parseNumber("0.15")], [self.parseNumber("100"), self.parseNumber("0.14")], [self.parseNumber("150"), self.parseNumber("0.13")], [self.parseNumber("300"), self.parseNumber("0.12")], [self.parseNumber("450"), self.parseNumber("0.11")], [self.parseNumber("500"), self.parseNumber("0.1")]],
            Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.2")], [self.parseNumber("1"), self.parseNumber("0.18")], [self.parseNumber("5"), self.parseNumber("0.16")], [self.parseNumber("10"), self.parseNumber("0.14")], [self.parseNumber("25"), self.parseNumber("0.12")], [self.parseNumber("75"), self.parseNumber("0.1")], [self.parseNumber("100"), self.parseNumber("0.08")], [self.parseNumber("150"), self.parseNumber("0.06")], [self.parseNumber("300"), self.parseNumber("0.04")], [self.parseNumber("450"), self.parseNumber("0.02")], [self.parseNumber("500"), self.parseNumber("0.01")]]
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerDirection") => false,
                Symbol("triggerPriceType") => nothing,
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
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 1,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1 / 12,
                Symbol("untilDays") => 1,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 500
            )
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
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("1001") => AuthenticationError,
        Symbol("1002") => AuthenticationError,
        Symbol("1003") => AuthenticationError,
        Symbol("1004") => AuthenticationError,
        Symbol("1005") => AuthenticationError,
        Symbol("1006") => AuthenticationError,
        Symbol("1007") => AuthenticationError,
        Symbol("1008") => AuthenticationError,
        Symbol("1009") => AuthenticationError,
        Symbol("1010") => AuthenticationError,
        Symbol("1011") => AuthenticationError,
        Symbol("1012") => AuthenticationError,
        Symbol("1013") => AuthenticationError,
        Symbol("1014") => AuthenticationError,
        Symbol("1015") => AuthenticationError,
        Symbol("1016") => AuthenticationError,
        Symbol("2010") => BadRequest,
        Symbol("2020") => BadRequest,
        Symbol("2021") => BadRequest,
        Symbol("2030") => BadRequest,
        Symbol("2040") => InsufficientFunds,
        Symbol("2050") => BadRequest,
        Symbol("2051") => BadRequest,
        Symbol("2052") => BadRequest,
        Symbol("2060") => BadRequest,
        Symbol("2061") => BadRequest,
        Symbol("2062") => BadRequest,
        Symbol("2070") => BadRequest,
        Symbol("3001") => BadRequest,
        Symbol("3020") => BadRequest,
        Symbol("3030") => BadRequest,
        Symbol("3040") => BadRequest,
        Symbol("3050") => BadRequest,
        Symbol("3060") => BadRequest,
        Symbol("3070") => BadRequest,
        Symbol("3080") => BadRequest,
        Symbol("3090") => BadRequest,
        Symbol("3100") => BadRequest,
        Symbol("3110") => BadRequest,
        Symbol("4001") => ExchangeNotAvailable,
        Symbol("6010") => InsufficientFunds
    ),
    Symbol("options") => Dict{Symbol, Any}()
))

end
function fetchMarkets(self::P2b, params=Dict())
    response = Base.fetch(self.publicGetMarkets(params));
    markets = safeValue(response, "result", []);
    return self.parseMarkets(markets)

end
function parseMarket(self::P2b, market)
    marketId = safeString(market, "name");
    baseId = safeString(market, "stock");
    quoteId = safeString(market, "money");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    limits = safeValue(market, "limits");
    maxAmount = safeString(limits, "max_amount");
    maxPrice = safeString(limits, "max_price");
    return Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => true,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(limits, "step_size"),
        Symbol("price") => self.safeNumber(limits, "tick_size")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(limits, "min_amount"),
            Symbol("max") => self.parseNumber(omitZero(maxAmount))
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(limits, "min_price"),
            Symbol("max") => self.parseNumber(omitZero(maxPrice))
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
)

end
function fetchTickers(self::P2b, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTickers(params));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseTickers(result, symbols)

end
function fetchTicker(self::P2b, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    timestamp = safeIntegerProduct(response, "cache_time", 1000);
    return extend(Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
), self.parseTicker(result, market))

end
function parseTicker(self::P2b, ticker, market=nothing)
    timestamp = safeIntegerProduct(ticker, "at", 1000);
    if functions.ccxtruthy(ccxt_in("ticker", ticker))
        ticker = safeValue(ticker, "ticker");
    end
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(ticker, "change"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString2(ticker, "vol", "volume"),
    Symbol("quoteVolume") => safeString(ticker, "deal"),
    Symbol("info") => ticker
), market)

end
function fetchOrderBook(self::P2b, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetDepthResult(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    timestamp = safeIntegerProduct(response, "current_time", 1000);
    return self.parseOrderBook(result, get(market, Symbol("symbol"), nothing), timestamp, "bids", "asks", 0, 1)

end
function fetchTrades(self::P2b, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    lastId = safeInteger(params, "lastId");
    if functions.ccxtruthy(lastId == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTrades () requires an extra parameter params[\"lastId\"]")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("lastId") => lastId
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetHistory(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseTrades(result, market, since, limit)

end
function parseTrade(self::P2b, trade, market=nothing)
    timestamp = safeIntegerProduct2(trade, "time", "deal_time", 1000);
    takerOrMaker = safeString(trade, "role");
    if functions.ccxtruthy(takerOrMaker == "1")
        takerOrMaker = "maker";
    elseif functions.ccxtruthy(takerOrMaker == "2")
        takerOrMaker = "taker";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString2(trade, "id", "deal_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("order") => safeString2(trade, "dealOrderId", "deal_order_id"),
    Symbol("type") => nothing,
    Symbol("side") => safeString2(trade, "type", "side"),
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "amount"),
    Symbol("cost") => safeString(trade, "deal"),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => safeString(market, "quote"),
        Symbol("cost") => safeString2(trade, "fee", "deal_fee")
    )
), market)

end
function fetchOHLCV(self::P2b, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("interval") => timeframe
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetMarketKline(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseOHLCVs(result, market, timeframe, since, limit)

end
function parseOHLCV(self::P2b, ohlcv, market=nothing)
    return [safeIntegerProduct(ohlcv, 0, 1000), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 5)]

end
function fetchBalance(self::P2b, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostAccountBalances(params));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseBalance(result)

end
function parseBalance(self::P2b, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    keys_var = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        currencyId = get(keys_var, i + 1, nothing);
        balance = get(response, Symbol(currencyId), nothing);
        code = self.safeCurrencyCode(currencyId);
        used = safeString(balance, "freeze");
        available = safeString(balance, "available");
        account = Dict{Symbol, Any}(
            Symbol("free") => available,
            Symbol("used") => used
        );
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function createOrder(self::P2b, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(type_var == "market")
        throw(BadRequest(string(self.id, " createOrder () can only accept orders with type \"limit\"")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("amount") => self.amountToPrecision(symbol, amount),
        Symbol("price") => self.priceToPrecision(symbol, price)
    );
    response = Base.fetch(self.privatePostOrderNew(extend(request, params)));
    result = self.safeDict(response, "result");
    return self.parseOrder(result, market)

end
function cancelOrder(self::P2b, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privatePostOrderCancel(extend(request, params)));
    result = self.safeDict(response, "result");
    return self.parseOrder(result)

end
function fetchOpenOrders(self::P2b, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders () requires the symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privatePostOrders(extend(request, params)));
    result = self.safeList(response, "result", []);
    return self.parseOrders(result, market, since, limit)

end
function fetchOrderTrades(self::P2b, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.safeMarket(symbol);
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privatePostAccountOrder(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    records = self.safeList(result, "records", []);
    return self.parseTrades(records, market, since, limit)

end
function fetchMyTrades(self::P2b, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    if functions.ccxtruthy(until == nothing)
        if functions.ccxtruthy(since == nothing)
            until = milliseconds();
        else
            until = since + 86400000;
        end
    end
    if functions.ccxtruthy(since == nothing)
        since = until - 86400000;
    end
    if functions.ccxtruthy(functions.ccxt_gt((until - since), 86400000))
        throw(BadRequest(string(self.id, " fetchMyTrades () the time between since and params[\"until\"] cannot be greater than 24 hours")));
    end
    market = self.market(symbol);
    sinceSec = self.parseToInt(since / 1000);
    untilSec = self.parseToInt(until / 1000);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("startTime") => sinceSec,
        Symbol("endTime") => untilSec
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privatePostAccountMarketDealHistory(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    deals = self.safeList(result, "deals", []);
    return self.parseTrades(deals, market, since, limit)

end
function fetchClosedOrders(self::P2b, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    until = safeInteger(params, "until");
    params = omit(params, "until");
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(until == nothing)
        if functions.ccxtruthy(since == nothing)
            until = milliseconds();
        else
            until = since + 86400000;
        end
    end
    if functions.ccxtruthy(since == nothing)
        since = until - 86400000;
    end
    if functions.ccxtruthy(functions.ccxt_gt((until - since), 86400000))
        throw(BadRequest(string(self.id, " fetchClosedOrders () the time between since and params[\"until\"] cannot be greater than 24 hours")));
    end
    sinceSec = self.parseToInt(since / 1000);
    untilSec = self.parseToInt(until / 1000);
    request = Dict{Symbol, Any}(
        Symbol("startTime") => sinceSec,
        Symbol("endTime") => untilSec
    );
    if functions.ccxtruthy(market != nothing)
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privatePostAccountOrderHistory(extend(request, params)));
    result = safeValue(response, "result");
    orders = [];
    keys_var = objectKeys(result);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        marketId = get(keys_var, i + 1, nothing);
        marketOrders = get(result, Symbol(marketId), nothing);
        parsedOrders = self.parseOrders(marketOrders, market, since, limit);
        orders = arrayConcat(orders, parsedOrders);
        i += 1
    end
    return orders

end
function parseOrder(self::P2b, order, market=nothing)
    timestamp = safeIntegerProduct2(order, "timestamp", "ctime", 1000);
    marketId = safeString(order, "market");
    market = self.safeMarket(marketId, market);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString2(order, "id", "orderId"),
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => safeString(order, "type"),
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => safeString(order, "side"),
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => safeString(order, "amount"),
    Symbol("cost") => nothing,
    Symbol("average") => nothing,
    Symbol("filled") => safeString(order, "dealStock"),
    Symbol("remaining") => safeString(order, "left"),
    Symbol("status") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => get(market, Symbol("quote"), nothing),
        Symbol("cost") => safeString(order, "dealFee")
    ),
    Symbol("trades") => nothing
), market)

end
function sign(self::P2b, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", self.implodeParams(path, params));
    params = omit(params, self.extractParams(path));
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    end
    if functions.ccxtruthy(api == "private")
        params[Symbol("request")] = string("/api/v2/", path);
        params[Symbol("nonce")] =         string(self.nonce());
        payload = self.stringToBase64(json(params));
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json",
            Symbol("X-TXC-APIKEY") => self.apiKey,
            Symbol("X-TXC-PAYLOAD") => payload,
            Symbol("X-TXC-SIGNATURE") => self.hmac(self.encode(payload), self.encode(self.secret), sha512)
        );
        body = json(params);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::P2b, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(code == 400)
        error = safeValue(response, "error");
        errorCode = safeString(error, "code");
        feedback = string(self.id, " ", json(response));
        self.throwExactlyMatchedException(self.exceptions, errorCode, feedback);
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::P2b, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarkets(self::P2b, params=Dict(), context=Dict())
    return request(self, "markets", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetMarket(self::P2b, params=Dict(), context=Dict())
    return request(self, "market", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTickers(self::P2b, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTicker(self::P2b, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetBook(self::P2b, params=Dict(), context=Dict())
    return request(self, "book", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "history", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDepthResult(self::P2b, params=Dict(), context=Dict())
    return request(self, "depth/result", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetMarketKline(self::P2b, params=Dict(), context=Dict())
    return request(self, "market/kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountBalances(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/balances", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountBalance(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/balance", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrderNew(self::P2b, params=Dict(), context=Dict())
    return request(self, "order/new", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrderCancel(self::P2b, params=Dict(), context=Dict())
    return request(self, "order/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrders(self::P2b, params=Dict(), context=Dict())
    return request(self, "orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountMarketOrderHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/market_order_history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountMarketDealHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/market_deal_history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountOrder(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountOrderHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/order_history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountExecutedHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/executed_history", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function P2b(; kwargs...)
    inst = P2b(Exchange(), describe, fetchMarkets, parseMarket, fetchTickers, fetchTicker, parseTicker, fetchOrderBook, fetchTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchBalance, parseBalance, createOrder, cancelOrder, fetchOpenOrders, fetchOrderTrades, fetchMyTrades, fetchClosedOrders, parseOrder, sign, handleErrors, publicGetMarkets, publicGetMarket, publicGetTickers, publicGetTicker, publicGetBook, publicGetHistory, publicGetDepthResult, publicGetMarketKline, privatePostAccountBalances, privatePostAccountBalance, privatePostOrderNew, privatePostOrderCancel, privatePostOrders, privatePostAccountMarketOrderHistory, privatePostAccountMarketDealHistory, privatePostAccountOrder, privatePostAccountOrderHistory, privatePostAccountExecutedHistory)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
