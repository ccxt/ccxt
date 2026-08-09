@kwdef mutable struct Btcbox <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOrdersByType::Function = fetchOrdersByType
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
    request::Function = request

# Generated REST endpoint fields
    publicGetDepth::Function = publicGetDepth
    publicGetOrders::Function = publicGetOrders
    publicGetTicker::Function = publicGetTicker
    publicGetTickers::Function = publicGetTickers
    privatePostBalance::Function = privatePostBalance
    privatePostTradeAdd::Function = privatePostTradeAdd
    privatePostTradeCancel::Function = privatePostTradeCancel
    privatePostTradeList::Function = privatePostTradeList
    privatePostTradeView::Function = privatePostTradeView
    privatePostWallet::Function = privatePostWallet
    webApiGetAjaxCoinCoinInfo::Function = webApiGetAjaxCoinCoinInfo

end
function describe(self::Btcbox, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "btcbox",
    Symbol("name") => "BtcBox",
    Symbol("countries") => ["JP"],
    Symbol("rateLimit") => 1000,
    Symbol("version") => "v1",
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
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
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
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
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
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false,
        Symbol("ws") => false
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/1e2cb499-8d0f-4f8f-9464-3c015cfbc76b",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://www.btcbox.co.jp/api"
        ),
        Symbol("www") => "https://www.btcbox.co.jp/",
        Symbol("doc") => "https://blog.btcbox.jp/en/archives/8762",
        Symbol("fees") => "https://support.btcbox.co.jp/hc/en-us/articles/360001235694-Fees-introduction"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => ["depth", "orders", "ticker", "tickers"]
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => ["balance", "trade_add", "trade_cancel", "trade_list", "trade_view", "wallet"]
        ),
        Symbol("webApi") => Dict{Symbol, Any}(
            Symbol("get") => ["ajax/coin/coinInfo"]
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("webApiEnable") => true,
            Symbol("webApiRetries") => 3
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
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
                    Symbol("PO") => false,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("trailing") => false,
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
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
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
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("104") => AuthenticationError,
        Symbol("105") => PermissionDenied,
        Symbol("106") => InvalidNonce,
        Symbol("107") => InvalidOrder,
        Symbol("200") => InsufficientFunds,
        Symbol("201") => InvalidOrder,
        Symbol("202") => InvalidOrder,
        Symbol("203") => OrderNotFound,
        Symbol("401") => OrderNotFound,
        Symbol("402") => DDoSProtection
    )
))

end
function fetchMarkets(self::Btcbox, params=Dict())
    promise1 = self.publicGetTickers();
    promise2 = self.fetchWebEndpoint("fetchMarkets", "webApiGetAjaxCoinCoinInfo", true);
    (response1, response2) = (Base.fetch(asyncmap(Base.fetch, [promise1, promise2])));
    result2Data = self.safeDict(response2, "data", Dict{Symbol, Any}());
    marketIds = objectKeys(response1);
    markets = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        symbolParts = split(marketId, "_");
        baseCurr = safeString(symbolParts, 0, "");
        quote_var = safeString(symbolParts, 1, "");
        quoteId = lowercase(quote_var);
        id = lowercase(baseCurr);
        res = get(response1, Symbol(marketId), nothing);
        symbol = string(baseCurr, "/", quote_var);
        fee = functions.ccxtruthy((id == "BTC")) ? self.parseNumber("0.0005") : self.parseNumber("0.0010");
        details = self.safeDict(result2Data, id, Dict{Symbol, Any}());
        tradeDetails = self.safeDict(details, "trade", Dict{Symbol, Any}());
        push!(markets, self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("uppercaseId") => nothing,
    Symbol("symbol") => symbol,
    Symbol("base") => baseCurr,
    Symbol("baseId") => id,
    Symbol("quote") => quote_var,
    Symbol("quoteId") => quoteId,
    Symbol("settle") => nothing,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("taker") => fee,
    Symbol("maker") => fee,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(tradeDetails, "pricedecimal"))),
        Symbol("amount") => nothing
    ),
    Symbol("active") => safeString(tradeDetails, "enable") == "1",
    Symbol("created") => nothing,
    Symbol("info") => res
)));
        i += 1
    end
    return markets

end
function parseMarket(self::Btcbox, market)
    baseId = safeString(market, "base");
    base = self.safeCurrencyCode(baseId);
    quoteId = safeString(market, "quote");
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(market, "symbol"),
    Symbol("uppercaseId") => nothing,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("baseId") => baseId,
    Symbol("quote") => quote_var,
    Symbol("quoteId") => quoteId,
    Symbol("settle") => nothing,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minLimitBaseAmount"),
            Symbol("max") => self.safeNumber(market, "maxLimitBaseAmount")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "quotePrecision"))),
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "basePrecision")))
    ),
    Symbol("active") => nothing,
    Symbol("created") => nothing,
    Symbol("info") => market
)

end
function parseBalance(self::Btcbox, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    codes = objectKeys(self.currencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        code = get(codes, i + 1, nothing);
        currency = self.currency(code);
        currencyId = get(currency, Symbol("id"), nothing);
        free = string(currencyId, "_balance");
        if functions.ccxtruthy(ccxt_in(free, response))
            account = self.account();
            used = string(currencyId, "_lock");
            account[Symbol("free")] = safeString(response, free);
            account[Symbol("used")] = safeString(response, used);
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Btcbox, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostBalance(params));
    return self.parseBalance(response)

end
function fetchOrderBook(self::Btcbox, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    numSymbols = functions.ccxtruthy((self.symbols == nothing)) ? 0 : length(self.symbols);
    if functions.ccxtruthy(functions.ccxt_gt(numSymbols, 1))
        request[Symbol("coin")] = get(market, Symbol("baseId"), nothing);
    end
    response = Base.fetch(self.publicGetDepth(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing))

end
function parseTicker(self::Btcbox, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
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
    Symbol("baseVolume") => safeString(ticker, "vol"),
    Symbol("quoteVolume") => safeString(ticker, "volume"),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Btcbox, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    numSymbols = functions.ccxtruthy((self.symbols == nothing)) ? 0 : length(self.symbols);
    if functions.ccxtruthy(functions.ccxt_gt(numSymbols, 1))
        request[Symbol("coin")] = get(market, Symbol("baseId"), nothing);
    end
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTickers(self::Btcbox, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTickers(params));
    return self.parseTickers(response, symbols)

end
function parseTrade(self::Btcbox, trade, market=nothing)
    timestamp = safeTimestamp(trade, "date");
    market = self.safeMarket(nothing, market);
    id = safeString(trade, "tid");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    type_var = nothing;
    side = safeString(trade, "type");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("order") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => nothing
), market)

end
function fetchTrades(self::Btcbox, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    numSymbols = functions.ccxtruthy((self.symbols == nothing)) ? 0 : length(self.symbols);
    if functions.ccxtruthy(functions.ccxt_gt(numSymbols, 1))
        request[Symbol("coin")] = get(market, Symbol("baseId"), nothing);
    end
    response = Base.fetch(self.publicGetOrders(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function createOrder(self::Btcbox, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount,
        Symbol("price") => price,
        Symbol("type") => side,
        Symbol("coin") => get(market, Symbol("baseId"), nothing)
    );
    response = Base.fetch(self.privatePostTradeAdd(extend(request, params)));
    return self.parseOrder(response, market)

end
function cancelOrder(self::Btcbox, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        symbol = "BTC/JPY";
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("coin") => get(market, Symbol("baseId"), nothing)
    );
    response = Base.fetch(self.privatePostTradeCancel(extend(request, params)));
    return self.parseOrder(response, market)

end
function parseOrderStatus(self::Btcbox, status)
    statuses = Dict{Symbol, Any}(
        Symbol("part") => "open",
        Symbol("all") => "closed",
        Symbol("cancelled") => "canceled",
        Symbol("closed") => "closed",
        Symbol("no") => "closed"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseOrder(self::Btcbox, order, market=nothing)
    id = safeString(order, "id");
    datetimeString = safeString(order, "datetime");
    timestamp = nothing;
    if functions.ccxtruthy(datetimeString != nothing)
        timestamp = self.parse8601(string(get(order, Symbol("datetime"), nothing), "+09:00"));
    end
    amount = safeString(order, "amount_original");
    remaining = safeString(order, "amount_outstanding");
    price = safeString(order, "price");
    status = self.parseOrderStatus(safeString(order, "status"));
    if functions.ccxtruthy(status == nothing)
        if functions.ccxtruthy(stringEquals(remaining, "0"))
            status = "closed";
        end
    end
    trades = nothing;
    market = self.safeMarket(nothing, market);
    side = safeString(order, "type");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("amount") => amount,
    Symbol("remaining") => remaining,
    Symbol("filled") => nothing,
    Symbol("side") => side,
    Symbol("type") => nothing,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => nothing,
    Symbol("trades") => trades,
    Symbol("fee") => nothing,
    Symbol("info") => order,
    Symbol("average") => nothing
), market)

end
function fetchOrder(self::Btcbox, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        symbol = "BTC/JPY";
    end
    market = self.market(symbol);
    request = extend(Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("coin") => get(market, Symbol("baseId"), nothing)
    ), params);
    response = Base.fetch(self.privatePostTradeView(extend(request, params)));
    return self.parseOrder(response, market)

end
function fetchOrdersByType(self::Btcbox, type_var, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        symbol = "BTC/JPY";
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => type_var,
        Symbol("coin") => get(market, Symbol("baseId"), nothing)
    );
    response = Base.fetch(self.privatePostTradeList(extend(request, params)));
    orders = self.parseOrders(response, market, since, limit);
    if functions.ccxtruthy(type_var == "open")
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
            orders[i + 1][Symbol("status")] = "open";
            i += 1
        end

    end
    return orders

end
function fetchOrders(self::Btcbox, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByType("all", symbol, since, limit, params))

end
function fetchOpenOrders(self::Btcbox, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByType("open", symbol, since, limit, params))

end
function nonce(self::Btcbox, )
    return milliseconds()

end
function sign(self::Btcbox, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing), "/", self.version, "/", path);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    elseif functions.ccxtruthy(api == "webApi")
        url = string(get(self.urls, Symbol("www"), nothing), "/", path);
    else
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        query = extend(Dict{Symbol, Any}(
            Symbol("key") => self.apiKey,
            Symbol("nonce") => nonce
        ), params);
        request = self.urlencode(query);
        secret = hash(self.encode(self.secret), md5);
        query[Symbol("signature")] = self.hmac(self.encode(request), self.encode(secret), sha256);
        body = self.urlencode(query);
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded"
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Btcbox, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(functions.ccxt_ge(httpCode, 400))
            return nothing
    end
    result = safeValue(response, "result");
    if functions.ccxtruthy(@functions.ccxt_or(result == nothing, result))
            return nothing
    end
    code = safeValue(response, "code");
    feedback = string(self.id, " ", body);
    self.throwExactlyMatchedException(self.exceptions, code, feedback);
    throw(ExchangeError(feedback));

end
function request(self::Btcbox, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing, config=Dict())
    response = Base.fetch(self.fetch2(path, api, method, params, headers, body, config));
    if functions.ccxtruthy(isa(response, AbstractString))
        response = self.strip(response);
        if functions.ccxtruthy(!functions.ccxtruthy(self.isJsonEncodedObject(response)))
            throw(ExchangeError(string(self.id, " ", response)));
        end
        response = JSON3.parse(response);
    end
    return response

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Btcbox, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetDepth(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "depth", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrders(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "orders", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTicker(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickers(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict())
end

function privatePostBalance(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeAdd(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "trade_add", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeCancel(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "trade_cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeList(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "trade_list", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeView(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "trade_view", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWallet(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "wallet", "private", "POST", params, nothing, nothing, Dict())
end

function webApiGetAjaxCoinCoinInfo(self::Btcbox, params=Dict(), context=Dict())
    return request(self, "ajax/coin/coinInfo", "webApi", "GET", params, nothing, nothing, Dict())
end

function Btcbox(; kwargs...)
    inst = Btcbox(Exchange(), describe, fetchMarkets, parseMarket, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, parseTrade, fetchTrades, createOrder, cancelOrder, parseOrderStatus, parseOrder, fetchOrder, fetchOrdersByType, fetchOrders, fetchOpenOrders, nonce, sign, handleErrors, request, publicGetDepth, publicGetOrders, publicGetTicker, publicGetTickers, privatePostBalance, privatePostTradeAdd, privatePostTradeCancel, privatePostTradeList, privatePostTradeView, privatePostWallet, webApiGetAjaxCoinCoinInfo)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
