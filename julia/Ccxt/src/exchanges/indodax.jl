@kwdef mutable struct Indodax <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    nonce::Function = nonce
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchTransactionFee::Function = fetchTransactionFee
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDepositAddresses::Function = fetchDepositAddresses
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetApiServerTime::Function = publicGetApiServerTime
    publicGetApiPairs::Function = publicGetApiPairs
    publicGetApiPriceIncrements::Function = publicGetApiPriceIncrements
    publicGetApiSummaries::Function = publicGetApiSummaries
    publicGetApiTickerPair::Function = publicGetApiTickerPair
    publicGetApiTickerAll::Function = publicGetApiTickerAll
    publicGetApiTradesPair::Function = publicGetApiTradesPair
    publicGetApiDepthPair::Function = publicGetApiDepthPair
    publicGetTradingviewHistoryV2::Function = publicGetTradingviewHistoryV2
    privatePostGetInfo::Function = privatePostGetInfo
    privatePostTransHistory::Function = privatePostTransHistory
    privatePostTrade::Function = privatePostTrade
    privatePostTradeHistory::Function = privatePostTradeHistory
    privatePostOpenOrders::Function = privatePostOpenOrders
    privatePostOrderHistory::Function = privatePostOrderHistory
    privatePostGetOrder::Function = privatePostGetOrder
    privatePostCancelOrder::Function = privatePostCancelOrder
    privatePostWithdrawFee::Function = privatePostWithdrawFee
    privatePostWithdrawCoin::Function = privatePostWithdrawCoin
    privatePostListDownline::Function = privatePostListDownline
    privatePostCheckDownline::Function = privatePostCheckDownline
    privatePostCreateVoucher::Function = privatePostCreateVoucher

end
function describe(self::Indodax, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "indodax",
    Symbol("name") => "INDODAX",
    Symbol("countries") => ["ID"],
    Symbol("rateLimit") => 50,
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
        Symbol("createOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
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
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => "emulated",
        Symbol("fetchDepositAddresses") => true,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => false,
        Symbol("fetchDepositsWithdrawals") => true,
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
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
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
        Symbol("fetchPositionForSymbolWs") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsForSymbolWs") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactionFee") => true,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("version") => "2.0",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://indodax.com",
            Symbol("private") => "https://indodax.com/tapi"
        ),
        Symbol("www") => "https://www.indodax.com",
        Symbol("doc") => "https://github.com/btcid/indodax-official-api-docs",
        Symbol("referral") => "https://indodax.com/ref/testbitcoincoid/1"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/server_time") => 5,
                Symbol("api/pairs") => 5,
                Symbol("api/price_increments") => 5,
                Symbol("api/summaries") => 5,
                Symbol("api/ticker/{pair}") => 5,
                Symbol("api/ticker_all") => 5,
                Symbol("api/trades/{pair}") => 5,
                Symbol("api/depth/{pair}") => 5,
                Symbol("tradingview/history_v2") => 5
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("getInfo") => 4,
                Symbol("transHistory") => 4,
                Symbol("trade") => 1,
                Symbol("tradeHistory") => 4,
                Symbol("openOrders") => 4,
                Symbol("orderHistory") => 4,
                Symbol("getOrder") => 4,
                Symbol("cancelOrder") => 4,
                Symbol("withdrawFee") => 4,
                Symbol("withdrawCoin") => 4,
                Symbol("listDownline") => 4,
                Symbol("checkDownline") => 4,
                Symbol("createVoucher") => 4
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => 0,
            Symbol("taker") => 0.003
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("invalid_pair") => BadSymbol,
            Symbol("Insufficient balance.") => InsufficientFunds,
            Symbol("invalid order.") => OrderNotFound,
            Symbol("Invalid credentials. API not found or session has expired.") => AuthenticationError,
            Symbol("Invalid credentials. Bad sign.") => AuthenticationError
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Minimum price") => InvalidOrder,
            Symbol("Minimum order") => InvalidOrder
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1",
        Symbol("15m") => "15",
        Symbol("30m") => "30",
        Symbol("1h") => "60",
        Symbol("4h") => "240",
        Symbol("1d") => "1D",
        Symbol("3d") => "3D",
        Symbol("1w") => "1W"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("recvWindow") => 5 * 1000,
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("XLM") => "Stellar Token",
            Symbol("BSC") => "bep20",
            Symbol("TRC20") => "trc20",
            Symbol("MATIC") => "polygon"
        )
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
                    Symbol("IOC") => true,
                    Symbol("FOK") => false,
                    Symbol("PO") => false,
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
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => nothing,
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
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 2000
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
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("STR") => "XLM",
        Symbol("BCHABC") => "BCH",
        Symbol("BCHSV") => "BSV",
        Symbol("DRK") => "DASH",
        Symbol("NEM") => "XEM"
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
function nonce(self::Indodax, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function fetchTime(self::Indodax, params=Dict())
    response = Base.fetch(self.publicGetApiServerTime(params));
    return safeInteger(response, "server_time")

end
function fetchMarkets(self::Indodax, params=Dict())
    response = Base.fetch(self.publicGetApiPairs(params));
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        market = get(response, i + 1, nothing);
        id = safeString(market, "id");
        baseId = safeString(market, "traded_currency");
        quoteId = safeString(market, "base_currency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        isMaintenance = safeInteger(market, "is_maintenance");
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
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => functions.ccxtruthy(isMaintenance) ? false : true,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.safeNumber(market, "trade_fee_percent"),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("percentage") => true,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber("1e-8"),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "price_round"))),
        Symbol("cost") => self.parseNumber(self.parsePrecision(safeString(market, "volume_precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "trade_min_traded_currency"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "trade_min_base_currency"),
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
function parseBalance(self::Indodax, response)
    balances = safeValue(response, "return", Dict{Symbol, Any}());
    free = safeValue(balances, "balance", Dict{Symbol, Any}());
    used = safeValue(balances, "balance_hold", Dict{Symbol, Any}());
    timestamp = safeTimestamp(balances, "server_time");
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    currencyIds = objectKeys(free);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(free, currencyId);
        account[Symbol("used")] = safeString(used, currencyId);
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Indodax, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetInfo(params));
    return self.parseBalance(response)

end
function fetchOrderBook(self::Indodax, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    orderbook = Base.fetch(self.publicGetApiDepthPair(extend(request, params)));
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), nothing, "buy", "sell")

end
function parseTicker(self::Indodax, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    timestamp = safeTimestamp(ticker, "server_time");
    baseVolume = string("vol_", safeStringLower(market, "baseId"));
    quoteVolume = string("vol_", safeStringLower(market, "quoteId"));
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "buy"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "sell"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, baseVolume),
    Symbol("quoteVolume") => safeString(ticker, quoteVolume),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Indodax, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetApiTickerPair(extend(request, params)));
    ticker = self.safeDict(response, "ticker", Dict{Symbol, Any}());
    return self.parseTicker(ticker, market)

end
function fetchTickers(self::Indodax, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetApiTickerAll(params));
    tickers = self.safeDict(response, "tickers", Dict{Symbol, Any}());
    keys_var = objectKeys(tickers);
    parsedTickers = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        rawTicker = get(tickers, Symbol(key), nothing);
        marketId = replace(key, "_" => "");
        market = self.safeMarket(marketId);
        parsed = self.parseTicker(rawTicker, market);
        parsedTickers[Symbol(marketId)] = parsed;
        i += 1
    end
    return self.filterByArray(parsedTickers, "symbol", symbols)

end
function parseTrade(self::Indodax, trade, market=nothing)
    timestamp = safeTimestamp(trade, "date");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString(trade, "tid"),
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => self.safeSymbol(nothing, market),
    Symbol("type") => nothing,
    Symbol("side") => safeString(trade, "type"),
    Symbol("order") => nothing,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "amount"),
    Symbol("cost") => nothing,
    Symbol("fee") => nothing
), market)

end
function fetchTrades(self::Indodax, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetApiTradesPair(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function parseOHLCV(self::Indodax, ohlcv, market=nothing)
    return [safeTimestamp(ohlcv, "Time"), self.safeNumber(ohlcv, "Open"), self.safeNumber(ohlcv, "High"), self.safeNumber(ohlcv, "Low"), self.safeNumber(ohlcv, "Close"), self.safeNumber(ohlcv, "Volume")]

end
function fetchOHLCV(self::Indodax, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    selectedTimeframe = safeString(self.timeframes, timeframe, timeframe);
    now = seconds();
    until = safeInteger(params, "until", now);
    params = omit(params, ["until"]);
    request = Dict{Symbol, Any}(
        Symbol("to") => until,
        Symbol("tf") => selectedTimeframe,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 1000;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = floor(since / 1000);
    else
        duration = self.parseTimeframe(timeframe);
        request[Symbol("from")] = now - limit * duration - 1;
    end
    response = Base.fetch(self.publicGetTradingviewHistoryV2(extend(request, params)));
    return self.parseOHLCVs(response, market, timeframe, since, limit)

end
function parseOrderStatus(self::Indodax, status)
    statuses = Dict{Symbol, Any}(
        Symbol("open") => "open",
        Symbol("filled") => "closed",
        Symbol("cancelled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Indodax, order, market=nothing)
    side = nothing;
    if functions.ccxtruthy(ccxt_in("type", order))
        side = get(order, Symbol("type"), nothing);
    end
    status = self.parseOrderStatus(safeString(order, "status", "open"));
    symbol = nothing;
    cost = nothing;
    price = safeString(order, "price");
    amount = nothing;
    remaining = nothing;
    marketId = safeString(order, "pair");
    market = self.safeMarket(marketId, market);
    if functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
        quoteId = get(market, Symbol("quoteId"), nothing);
        baseId = get(market, Symbol("baseId"), nothing);
        if functions.ccxtruthy(@functions.ccxt_and((get(market, Symbol("quoteId"), nothing) == "idr"), (ccxt_in("order_rp", order))))
            quoteId = "rp";
        end
        if functions.ccxtruthy(@functions.ccxt_and((get(market, Symbol("baseId"), nothing) == "idr"), (ccxt_in("remain_rp", order))))
            baseId = "rp";
        end
        cost = safeString(order, string("order_", quoteId));
        if functions.ccxtruthy(!functions.ccxtruthy(cost))
            amount = safeString(order, string("order_", baseId));
            remaining = safeString(order, string("remain_", baseId));
        end
    end
    timestamp = safeInteger(order, "submit_time");
    fee = nothing;
    id = safeString(order, "order_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => safeString(order, "client_order_id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => symbol,
    Symbol("type") => "limit",
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => cost,
    Symbol("average") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
))

end
function fetchOrder(self::Indodax, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privatePostGetOrder(extend(request, params)));
    orders = get(response, Symbol("return"), nothing);
    order = self.parseOrder(extend(Dict{Symbol, Any}(
        Symbol("id") => id
    ), get(orders, Symbol("order"), nothing)), market);
    order[Symbol("info")] = response;
    return order

end
function fetchOpenOrders(self::Indodax, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostOpenOrders(extend(request, params)));
    rawOrders = get(get(response, Symbol("return"), nothing), Symbol("orders"), nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(rawOrders))
            return []
    end
    if functions.ccxtruthy(symbol != nothing)
            return self.parseOrders(rawOrders, market, since, limit)
    end
    marketIds = objectKeys(rawOrders);
    exchangeOrders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        marketOrders = get(rawOrders, Symbol(marketId), nothing);
        market = self.safeMarket(marketId);
        parsedOrders = self.parseOrders(marketOrders, market, since, limit);
        exchangeOrders = arrayConcat(exchangeOrders, parsedOrders);
        i += 1
    end
    return exchangeOrders

end
function fetchClosedOrders(self::Indodax, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostOrderHistory(extend(request, params)));
    orders = self.parseOrders(get(get(response, Symbol("return"), nothing), Symbol("orders"), nothing), market);
    orders = filterBy(orders, "status", "closed");
    return self.filterBySymbolSinceLimit(orders, symbol, since, limit)

end
function createOrder(self::Indodax, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("type") => side,
        Symbol("price") => price
    );
    priceIsRequired = false;
    quantityIsRequired = false;
    if functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(side == "buy")
            quoteAmount = nothing;
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(cost != nothing)
                quoteAmount = self.costToPrecision(symbol, cost);
            else
                if functions.ccxtruthy(price == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price).")));
                end
                amountString = numberToString(amount);
                priceString = numberToString(price);
                costRequest = stringMul(amountString, priceString);
                quoteAmount = self.costToPrecision(symbol, costRequest);
            end
            request[Symbol(market[Symbol("quoteId")])] = quoteAmount;
        else
            quantityIsRequired = true;
        end
    elseif functions.ccxtruthy(type_var == "limit")
        priceIsRequired = true;
        quantityIsRequired = true;
        if functions.ccxtruthy(side == "buy")
            request[Symbol(market[Symbol("quoteId")])] = self.parseToNumeric(stringMul(numberToString(amount), numberToString(price)));
        end
    end
    if functions.ccxtruthy(priceIsRequired)
        if functions.ccxtruthy(price == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a price argument for a ", type_var, " order")));
        end
        request[Symbol("price")] = price;
    end
    if functions.ccxtruthy(quantityIsRequired)
        request[Symbol(market[Symbol("baseId")])] = self.amountToPrecision(symbol, amount);
    end
    result = Base.fetch(self.privatePostTrade(extend(request, params)));
    data = safeValue(result, "return", Dict{Symbol, Any}());
    id = safeString(data, "order_id");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => result,
    Symbol("id") => id
), market)

end
function cancelOrder(self::Indodax, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    side = safeValue(params, "side");
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires an extra \"side\" param")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("type") => side
    );
    response = Base.fetch(self.privatePostCancelOrder(extend(request, params)));
    data = self.safeDict(response, "return");
    return self.parseOrder(data)

end
function fetchTransactionFee(self::Indodax, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostWithdrawFee(extend(request, params)));
    data = safeValue(response, "return", Dict{Symbol, Any}());
    currencyId = safeString(data, "currency");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("rate") => self.safeNumber(data, "withdraw_fee"),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency)
)

end
function fetchDepositsWithdrawals(self::Indodax, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        startTime = self.yyyymmdd(since);
        request[Symbol("start")] = startTime;
        request[Symbol("end")] = self.yyyymmdd(milliseconds());
    end
    response = Base.fetch(self.privatePostTransHistory(extend(request, params)));
    data = safeValue(response, "return", Dict{Symbol, Any}());
    withdraw = safeValue(data, "withdraw", Dict{Symbol, Any}());
    deposit = safeValue(data, "deposit", Dict{Symbol, Any}());
    transactions = [];
    currency = nothing;
    if functions.ccxtruthy(code == nothing)
        keys_var = objectKeys(withdraw);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            key = get(keys_var, i + 1, nothing);
            transactions = arrayConcat(transactions, get(withdraw, Symbol(key), nothing));
            i += 1
        end

        keys_var = objectKeys(deposit);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            key = get(keys_var, i + 1, nothing);
            transactions = arrayConcat(transactions, get(deposit, Symbol(key), nothing));
            i += 1
        end

    else
        currency = self.currency(code);
        withdraws = safeValue(withdraw, get(currency, Symbol("id"), nothing), []);
        deposits = safeValue(deposit, get(currency, Symbol("id"), nothing), []);
        transactions = arrayConcat(withdraws, deposits);
    end
    return self.parseTransactions(transactions, currency, since, limit)

end
function withdraw(self::Indodax, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    requestId = milliseconds();
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("withdraw_amount") => amount,
        Symbol("withdraw_address") => address,
        Symbol("request_id") => string(requestId)
    );
    if functions.ccxtruthy(tag)
        request[Symbol("withdraw_memo")] = tag;
    end
    response = Base.fetch(self.privatePostWithdrawCoin(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function parseTransaction(self::Indodax, transaction, currency=nothing)
    status = safeString(transaction, "status");
    timestamp = safeTimestamp2(transaction, "success_time", "submit_time");
    depositId = safeString(transaction, "deposit_id");
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => self.safeCurrencyCode(nothing, currency),
            Symbol("cost") => feeCost,
            Symbol("rate") => nothing
        );
    end
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(transaction, "withdraw_id", "deposit_id"),
    Symbol("txid") => safeString2(transaction, "txid", "tx"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("address") => safeString(transaction, "withdraw_address"),
    Symbol("addressTo") => nothing,
    Symbol("amount") => self.safeNumberN(transaction, ["amount", "withdraw_amount", "deposit_amount"]),
    Symbol("type") => functions.ccxtruthy((depositId == nothing)) ? "withdraw" : "deposit",
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("updated") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("comment") => safeString(transaction, "withdraw_memo"),
    Symbol("internal") => nothing,
    Symbol("fee") => fee,
    Symbol("info") => transaction
)

end
function parseTransactionStatus(self::Indodax, status)
    statuses = Dict{Symbol, Any}(
        Symbol("success") => "ok"
    );
    return safeString(statuses, status, status)

end
function fetchDepositAddresses(self::Indodax, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetInfo(params));
    data = self.safeDict(response, "return");
    addresses = self.safeDict(data, "address", Dict{Symbol, Any}());
    networks = self.safeDict(data, "network", Dict{Symbol, Any}());
    addressKeys = objectKeys(addresses);
    result = Dict{Symbol, Any}(
        Symbol("info") => data
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(addressKeys)))
        marketId = get(addressKeys, i + 1, nothing);
        code = self.safeCurrencyCode(marketId);
        address = safeString(addresses, marketId);
        if functions.ccxtruthy(@functions.ccxt_and((address != nothing), (@functions.ccxt_or((codes == nothing), (inArray(code, codes))))))
            self.checkAddress(address);
            network = nothing;
            if functions.ccxtruthy(ccxt_in(marketId, networks))
                networkId = safeString(networks, marketId);
                if functions.ccxtruthy(findfirst(",", networkId) !== nothing)
                    network = [];
                    networkIds = split(networkId, ",");
                    j = 0
                    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkIds)))
                        push!(network, uppercase(self.networkIdToCode(get(networkIds, j + 1, nothing), code)));
                        j += 1
                    end

                else
                    network = uppercase(self.networkIdToCode(networkId, code));
                end
            end
            finalNetwork = network;
            result[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("info") => Dict{Symbol, Any}(),
                Symbol("currency") => code,
                Symbol("network") => finalNetwork,
                Symbol("address") => address,
                Symbol("tag") => nothing
            );
        end
        i += 1
    end
    return result

end
function sign(self::Indodax, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing);
    if functions.ccxtruthy(api == "public")
        query = omit(params, self.extractParams(path));
        requestPath = string("/", self.implodeParams(path, params));
        url = string(url, requestPath);
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencodeWithArrayRepeat(query));
        end
    else
        self.checkRequiredCredentials();
        body = self.urlencode(extend(Dict{Symbol, Any}(
    Symbol("method") => path,
    Symbol("timestamp") => self.nonce(),
    Symbol("recvWindow") => get(self.options, Symbol("recvWindow"), nothing)
), params));
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded",
            Symbol("Key") => self.apiKey,
            Symbol("Sign") => self.hmac(self.encode(body), self.encode(self.secret), sha512)
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Indodax, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(functions.ccxt_isArray(response))
            return nothing
    end
    error = safeValue(response, "error", "");
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy((ccxt_in("success", response))), error == ""))
            return nothing
    end
    status = safeString(response, "success");
    if functions.ccxtruthy(status == "approved")
            return nothing
    end
    if functions.ccxtruthy(safeInteger(response, "success", 0) == 1)
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("return", response))))
            throw(ExchangeError(string(self.id, ": malformed response: ", json(response))));
        else
            return nothing
        end
    end
    feedback = string(self.id, " ", body);
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
    self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, feedback);
    throw(ExchangeError(feedback));

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Indodax, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetApiServerTime(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/server_time", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetApiPairs(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/pairs", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetApiPriceIncrements(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/price_increments", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetApiSummaries(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/summaries", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetApiTickerPair(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/ticker/{pair}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetApiTickerAll(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/ticker_all", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetApiTradesPair(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/trades/{pair}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetApiDepthPair(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/depth/{pair}", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetTradingviewHistoryV2(self::Indodax, params=Dict(), context=Dict())
    return request(self, "tradingview/history_v2", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostGetInfo(self::Indodax, params=Dict(), context=Dict())
    return request(self, "getInfo", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostTransHistory(self::Indodax, params=Dict(), context=Dict())
    return request(self, "transHistory", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostTrade(self::Indodax, params=Dict(), context=Dict())
    return request(self, "trade", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostTradeHistory(self::Indodax, params=Dict(), context=Dict())
    return request(self, "tradeHistory", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostOpenOrders(self::Indodax, params=Dict(), context=Dict())
    return request(self, "openOrders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostOrderHistory(self::Indodax, params=Dict(), context=Dict())
    return request(self, "orderHistory", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostGetOrder(self::Indodax, params=Dict(), context=Dict())
    return request(self, "getOrder", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostCancelOrder(self::Indodax, params=Dict(), context=Dict())
    return request(self, "cancelOrder", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostWithdrawFee(self::Indodax, params=Dict(), context=Dict())
    return request(self, "withdrawFee", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostWithdrawCoin(self::Indodax, params=Dict(), context=Dict())
    return request(self, "withdrawCoin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostListDownline(self::Indodax, params=Dict(), context=Dict())
    return request(self, "listDownline", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostCheckDownline(self::Indodax, params=Dict(), context=Dict())
    return request(self, "checkDownline", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privatePostCreateVoucher(self::Indodax, params=Dict(), context=Dict())
    return request(self, "createVoucher", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function Indodax(; kwargs...)
    inst = Indodax(Exchange(), describe, nonce, fetchTime, fetchMarkets, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, parseOrderStatus, parseOrder, fetchOrder, fetchOpenOrders, fetchClosedOrders, createOrder, cancelOrder, fetchTransactionFee, fetchDepositsWithdrawals, withdraw, parseTransaction, parseTransactionStatus, fetchDepositAddresses, sign, handleErrors, publicGetApiServerTime, publicGetApiPairs, publicGetApiPriceIncrements, publicGetApiSummaries, publicGetApiTickerPair, publicGetApiTickerAll, publicGetApiTradesPair, publicGetApiDepthPair, publicGetTradingviewHistoryV2, privatePostGetInfo, privatePostTransHistory, privatePostTrade, privatePostTradeHistory, privatePostOpenOrders, privatePostOrderHistory, privatePostGetOrder, privatePostCancelOrder, privatePostWithdrawFee, privatePostWithdrawCoin, privatePostListDownline, privatePostCheckDownline, privatePostCreateVoucher)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
