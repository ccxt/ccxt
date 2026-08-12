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
                Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depth/result") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/new") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/market_order_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/market_deal_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/order_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/executed_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
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
"""
retrieves data on all markets for bigone
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::P2b; params=Dict())
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
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://futures-docs.poloniex.com/#get-real-time-ticker-of-all-symbols

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::P2b; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTickers(params));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseTickers(result, symbols = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::P2b, symbol; params=Dict())
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
), self.parseTicker(result, market = market))

end
function parseTicker(self::P2b, ticker; market=nothing)
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
), market = market)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#depth-result

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.interval`::string, optional: 0 (default), 0.00000001, 0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::P2b, symbol; limit=nothing, params=Dict())
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
    return self.parseOrderBook(result, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = 0, amountKey = 1)

end
"""
get the list of most recent trades for a particular symbol
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: 1-100, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.lastId`::int: order id

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::P2b, symbol; since=nothing, limit=nothing, params=Dict())
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
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseTrades(result, market = market, since = since, limit = limit)

end
function parseTrade(self::P2b, trade; market=nothing)
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
), market = market)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: 1m, 1h, or 1d
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: 1-500, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.offset`::int, optional: default=0, with this value the last candles are returned

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::P2b, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOHLCVs(result, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::P2b, ohlcv; market=nothing)
    return [safeIntegerProduct(ohlcv, 0, 1000), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 5)]

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#all-balances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::P2b; params=Dict())
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
"""
create a trade order
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: must be 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::P2b, symbol, type_var, side, amount; price=nothing, params=Dict())
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
    return self.parseOrder(result, market = market)

end
"""
cancels an open order
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::P2b, id; symbol=nothing, params=Dict())
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
"""
fetch all unfilled currently open orders
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#open-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: 0-10000, default=0

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::P2b; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    result = self.safeList(response, "result", defaultValue = []);
    return self.parseOrders(result, market = market, since = since, limit = limit)

end
"""
fetch all the trades made from a single order
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-by-order-id

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: 1-100, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: 0-10000, default=0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::P2b, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.safeMarket(marketId = symbol);
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privatePostAccountOrder(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    records = self.safeList(result, "records", defaultValue = []);
    return self.parseTrades(records, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user, only the transaction records in the past 3 month can be queried, the time between since and params["until"] cannot be longer than 24 hours
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-history-by-market

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for, default = params["until"] - 86400000
- `limit`::int, optional: 1-100, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for, default = current timestamp or since + 86400000 EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: 0-10000, default=0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchMyTrades(self::P2b; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    deals = self.safeList(result, "deals", defaultValue = []);
    return self.parseTrades(deals, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user, the time between since and params["untnil"] cannot be longer than 24 hours
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#orders-history-by-market

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for, default = params["until"] - 86400000
- `limit`::int, optional: 1-100, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for, default = current timestamp or since + 86400000 EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: 0-10000, default=0

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::P2b; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        parsedOrders = self.parseOrders(marketOrders, market = market, since = since, limit = limit);
        orders = arrayConcat(orders, parsedOrders);
        i += 1
    end
    return orders

end
function parseOrder(self::P2b, order; market=nothing)
    timestamp = safeIntegerProduct2(order, "timestamp", "ctime", 1000);
    marketId = safeString(order, "market");
    market = self.safeMarket(marketId = marketId, market = market);
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
), market = market)

end
function sign(self::P2b, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::P2b, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarkets(self::P2b, params=Dict(), context=Dict())
    return request(self, "markets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarket(self::P2b, params=Dict(), context=Dict())
    return request(self, "market"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickers(self::P2b, params=Dict(), context=Dict())
    return request(self, "tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::P2b, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetBook(self::P2b, params=Dict(), context=Dict())
    return request(self, "book"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDepthResult(self::P2b, params=Dict(), context=Dict())
    return request(self, "depth/result"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketKline(self::P2b, params=Dict(), context=Dict())
    return request(self, "market/kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountBalances(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/balances"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountBalance(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/balance"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderNew(self::P2b, params=Dict(), context=Dict())
    return request(self, "order/new"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderCancel(self::P2b, params=Dict(), context=Dict())
    return request(self, "order/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::P2b, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountMarketOrderHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/market_order_history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountMarketDealHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/market_deal_history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountOrder(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountOrderHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/order_history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountExecutedHistory(self::P2b, params=Dict(), context=Dict())
    return request(self, "account/executed_history"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function P2b(; kwargs...)
    inst = P2b(Exchange(), describe, fetchMarkets, parseMarket, fetchTickers, fetchTicker, parseTicker, fetchOrderBook, fetchTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchBalance, parseBalance, createOrder, cancelOrder, fetchOpenOrders, fetchOrderTrades, fetchMyTrades, fetchClosedOrders, parseOrder, sign, handleErrors, publicGetMarkets, publicGetMarket, publicGetTickers, publicGetTicker, publicGetBook, publicGetHistory, publicGetDepthResult, publicGetMarketKline, privatePostAccountBalances, privatePostAccountBalance, privatePostOrderNew, privatePostOrderCancel, privatePostOrders, privatePostAccountMarketOrderHistory, privatePostAccountMarketDealHistory, privatePostAccountOrder, privatePostAccountOrderHistory, privatePostAccountExecutedHistory)
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
function __ccxt_doc_P2b_fetchMarkets() end
"""
retrieves data on all markets for bigone
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_P2b_fetchMarkets

function __ccxt_doc_P2b_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://futures-docs.poloniex.com/#get-real-time-ticker-of-all-symbols

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_P2b_fetchTickers

function __ccxt_doc_P2b_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_P2b_fetchTicker

function __ccxt_doc_P2b_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#depth-result

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.interval`::string, optional: 0 (default), 0.00000001, 0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_P2b_fetchOrderBook

function __ccxt_doc_P2b_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: 1-100, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.lastId`::int: order id

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_P2b_fetchTrades

function __ccxt_doc_P2b_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: 1m, 1h, or 1d
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: 1-500, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.offset`::int, optional: default=0, with this value the last candles are returned

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_P2b_fetchOHLCV

function __ccxt_doc_P2b_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#all-balances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_P2b_fetchBalance

function __ccxt_doc_P2b_createOrder() end
"""
create a trade order
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: must be 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_P2b_createOrder

function __ccxt_doc_P2b_cancelOrder() end
"""
cancels an open order
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_P2b_cancelOrder

function __ccxt_doc_P2b_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#open-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: 0-10000, default=0

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_P2b_fetchOpenOrders

function __ccxt_doc_P2b_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-by-order-id

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: 1-100, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: 0-10000, default=0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_P2b_fetchOrderTrades

function __ccxt_doc_P2b_fetchMyTrades() end
"""
fetch all trades made by the user, only the transaction records in the past 3 month can be queried, the time between since and params["until"] cannot be longer than 24 hours
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-history-by-market

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for, default = params["until"] - 86400000
- `limit`::int, optional: 1-100, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for, default = current timestamp or since + 86400000 EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: 0-10000, default=0

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_P2b_fetchMyTrades

function __ccxt_doc_P2b_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user, the time between since and params["untnil"] cannot be longer than 24 hours
see: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#orders-history-by-market

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for, default = params["until"] - 86400000
- `limit`::int, optional: 1-100, default=50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for, default = current timestamp or since + 86400000 EXCHANGE SPECIFIC PARAMETERS
- `params.offset`::int, optional: 0-10000, default=0

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_P2b_fetchClosedOrders
