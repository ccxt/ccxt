@kwdef mutable struct Mudrex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    sign::Function = sign
    handleErrors::Function = handleErrors
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchMarkOHLCV::Function = fetchMarkOHLCV
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchLeverage::Function = fetchLeverage
    setLeverage::Function = setLeverage
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    cancelOrder::Function = cancelOrder
    fetchOrder::Function = fetchOrder
    fetchOrdersByState::Function = fetchOrdersByState
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchPositions::Function = fetchPositions
    fetchPositionsHistory::Function = fetchPositionsHistory
    parsePosition::Function = parsePosition
    closePosition::Function = closePosition
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    transfer::Function = transfer

# Generated REST endpoint fields
    marketGetPriceKline::Function = marketGetPriceKline
    marketGetPriceMarkKline::Function = marketGetPriceMarkKline
    privateGetFutures::Function = privateGetFutures
    privateGetFuturesAssetId::Function = privateGetFuturesAssetId
    privateGetWalletFunds::Function = privateGetWalletFunds
    privateGetFuturesFunds::Function = privateGetFuturesFunds
    privateGetFuturesOrders::Function = privateGetFuturesOrders
    privateGetFuturesOrdersHistory::Function = privateGetFuturesOrdersHistory
    privateGetFuturesOrdersOrderId::Function = privateGetFuturesOrdersOrderId
    privateGetFuturesPositions::Function = privateGetFuturesPositions
    privateGetFuturesPositionsHistory::Function = privateGetFuturesPositionsHistory
    privateGetFuturesFeeHistory::Function = privateGetFuturesFeeHistory
    privateGetFuturesAssetIdLeverage::Function = privateGetFuturesAssetIdLeverage
    privateGetFuturesPositionsPositionIdLiqPrice::Function = privateGetFuturesPositionsPositionIdLiqPrice
    privatePostWalletFuturesTransfer::Function = privatePostWalletFuturesTransfer
    privatePostFuturesTransfersInr::Function = privatePostFuturesTransfersInr
    privatePostFuturesAssetIdOrder::Function = privatePostFuturesAssetIdOrder
    privatePostFuturesPositionsPositionIdClose::Function = privatePostFuturesPositionsPositionIdClose
    privatePostFuturesPositionsPositionIdClosePartial::Function = privatePostFuturesPositionsPositionIdClosePartial
    privatePostFuturesPositionsPositionIdReverse::Function = privatePostFuturesPositionsPositionIdReverse
    privatePostFuturesPositionsPositionIdAddMargin::Function = privatePostFuturesPositionsPositionIdAddMargin
    privatePostFuturesPositionsPositionIdRiskorder::Function = privatePostFuturesPositionsPositionIdRiskorder
    privatePostFuturesAssetIdLeverage::Function = privatePostFuturesAssetIdLeverage
    privatePatchFuturesOrdersOrderId::Function = privatePatchFuturesOrdersOrderId
    privatePatchFuturesPositionsPositionIdRiskorder::Function = privatePatchFuturesPositionsPositionIdRiskorder
    privateDeleteFuturesOrdersOrderId::Function = privateDeleteFuturesOrdersOrderId

end
function describe(self::Mudrex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "mudrex",
    Symbol("name") => "Mudrex",
    Symbol("countries") => ["IN"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v1",
    Symbol("pro") => true,
    Symbol("certified") => false,
    Symbol("dex") => false,
    Symbol("hostname") => "trade.mudrex.com",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("cancelOrder") => true,
        Symbol("closePosition") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => false,
        Symbol("reduceMargin") => true,
        Symbol("setLeverage") => true,
        Symbol("transfer") => true,
        Symbol("watchOHLCV") => true,
        Symbol("watchTicker") => true,
        Symbol("watchTickers") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3t",
        Symbol("5m") => "5t",
        Symbol("10m") => "10t",
        Symbol("15m") => "15t",
        Symbol("30m") => "30t",
        Symbol("1h") => "1h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1mth"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/72368864-84ed-43eb-8c75-d4fb77023b42",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://trade.mudrex.com/fapi/v1",
            Symbol("private") => "https://trade.mudrex.com/fapi/v1",
            Symbol("market") => "https://trade.mudrex.com/fapi/v1"
        ),
        Symbol("www") => "https://mudrex.com",
        Symbol("doc") => "https://docs.trade.mudrex.com/docs",
        Symbol("fees") => "https://docs.trade.mudrex.com"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("market") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("price/kline") => 1,
                Symbol("price/mark-kline") => 1
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}()
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("futures") => 1,
                Symbol("futures/{asset_id}") => 1,
                Symbol("wallet/funds") => 5,
                Symbol("futures/funds") => 5,
                Symbol("futures/orders") => 1,
                Symbol("futures/orders/history") => 1,
                Symbol("futures/orders/{order_id}") => 1,
                Symbol("futures/positions") => 1,
                Symbol("futures/positions/history") => 1,
                Symbol("futures/fee/history") => 1,
                Symbol("futures/{asset_id}/leverage") => 2,
                Symbol("futures/positions/{position_id}/liq-price") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("wallet/futures/transfer") => 5,
                Symbol("futures/transfers/inr") => 5,
                Symbol("futures/{asset_id}/order") => 2,
                Symbol("futures/positions/{position_id}/close") => 2,
                Symbol("futures/positions/{position_id}/close/partial") => 2,
                Symbol("futures/positions/{position_id}/reverse") => 2,
                Symbol("futures/positions/{position_id}/add-margin") => 2,
                Symbol("futures/positions/{position_id}/riskorder") => 2,
                Symbol("futures/{asset_id}/leverage") => 2
            ),
            Symbol("patch") => Dict{Symbol, Any}(
                Symbol("futures/orders/{order_id}") => 1,
                Symbol("futures/positions/{position_id}/riskorder") => 2
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("futures/orders/{order_id}") => 2
            )
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => true
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.00059"),
            Symbol("maker") => self.parseNumber("0.00023")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "swap",
        Symbol("broker") => "42ce8902-8585-448c-a1e8-0371a6ca7ca8"
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("400 Invalid trade currency") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Invalid trade currency") => BadRequest,
            Symbol("Params error") => BadRequest,
            Symbol("invalid trigger type") => BadRequest,
            Symbol("invalid order type") => BadRequest,
            Symbol("order price out of permissible range") => BadRequest,
            Symbol("quantity not a multiple of the quantity step") => BadRequest,
            Symbol("leverage out of permissible range") => BadRequest,
            Symbol("insufficient balance") => InsufficientFunds,
            Symbol("asset not found") => BadSymbol,
            Symbol("leverage not found") => OrderNotFound,
            Symbol("order not found") => OrderNotFound,
            Symbol("Rate limit exceeded") => RateLimitExceeded
        )
    )
))

end
function sign(self::Mudrex, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    apiUrls = self.safeDict(self.urls, "api", Dict{Symbol, Any}());
    base = safeString(apiUrls, api);
    if functions.ccxtruthy(base == nothing)
        throw(ExchangeError(string(self.id, " unknown API namespace: ", api)));
    end
    url = string(base, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    headers = functions.ccxtruthy((headers != nothing)) ? extend(Dict{Symbol, Any}(), headers) : Dict{Symbol, Any}();
    brokerId = safeString(self.options, "broker");
    if functions.ccxtruthy(brokerId != nothing)
        headers[Symbol("Partner-Id")] = brokerId;
    end
    methodUpper = uppercase(method);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        headers[Symbol("X-Authentication")] = self.secret;
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(methodUpper == "POST", methodUpper == "PATCH"), methodUpper == "DELETE"))
            headers[Symbol("Content-Type")] = "application/json";
            isSymbol = safeString(query, "is_symbol");
            if functions.ccxtruthy(isSymbol != nothing)
                query = omit(query, "is_symbol");
                url += string("?", self.urlencode(Dict{Symbol, Any}(
    Symbol("is_symbol") => isSymbol
)));
            end
            if functions.ccxtruthy(@functions.ccxt_and((methodUpper == "DELETE"), isEmpty(query)))
                    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => methodUpper,
    Symbol("body") => nothing,
    Symbol("headers") => headers
)
            end
            bodyStr = json(query);
                return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => methodUpper,
    Symbol("body") => bodyStr,
    Symbol("headers") => headers
)
        end
    end
    if functions.ccxtruthy(length(objectKeys(query)))
        url += string("?", self.urlencode(query));
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => methodUpper,
    Symbol("body") => nothing,
    Symbol("headers") => headers
)

end
function handleErrors(self::Mudrex, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or(response == nothing, !isa(response, Dict)))
            return nothing
    end
    success = self.safeBool(response, "success", true);
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        errors = self.safeList(response, "errors", []);
        first_var = self.safeDict(errors, 0, Dict{Symbol, Any}());
        text = safeString(first_var, "text", json(response));
        errCode = safeString(first_var, "code");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), text, string(self.id, " ", text));
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errCode, string(self.id, " ", text));
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), text, string(self.id, " ", text));
        msg = string(self.id, " ", text);
        low = lowercase(text);
        if functions.ccxtruthy(@functions.ccxt_or(code == 401, findfirst("auth", low) !== nothing))
            throw(AuthenticationError(msg));
        end
        if functions.ccxtruthy(@functions.ccxt_or(code == 429, findfirst("rate", low) !== nothing))
            throw(RateLimitExceeded(msg));
        end
        if functions.ccxtruthy(findfirst("insufficient", low) !== nothing)
            throw(InsufficientFunds(msg));
        end
        if functions.ccxtruthy(code == 400)
            throw(BadRequest(msg));
        end
        throw(ExchangeError(msg));
    end
    return nothing

end
function parseOHLCV(self::Mudrex, ohlcv, market=nothing)
    return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchOHLCV(self::Mudrex, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    priceType = safeString(params, "price");
    params = omit(params, "price");
    assetPair = string(get(market, Symbol("baseId"), nothing), "/", get(market, Symbol("quoteId"), nothing));
    request = Dict{Symbol, Any}(
        Symbol("assets") => assetPair,
        Symbol("aggregation") => safeString(self.timeframes, timeframe, timeframe)
    );
    duration = self.parseTimeframe(timeframe);
    requestLimit = limit;
    if functions.ccxtruthy(requestLimit == nothing)
        requestLimit = 500;
    end
    now = seconds();
    startTime = nothing;
    if functions.ccxtruthy(since != nothing)
        startTime = self.parseToInt(since / 1000);
    else
        startTime = now - duration * requestLimit;
    end
    endTime = startTime + duration * requestLimit;
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        endTime = self.parseToInt(until / 1000);
    elseif functions.ccxtruthy(functions.ccxt_gt(endTime, now))
        endTime = now;
    end
    request[Symbol("start_time")] = startTime;
    request[Symbol("end_time")] = endTime;
    response = nothing;
    if functions.ccxtruthy(priceType == "mark")
        response = Base.fetch(self.marketGetPriceMarkKline(extend(request, params)));
    else
        response = Base.fetch(self.marketGetPriceKline(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    assetTicks = self.safeDict(data, "asset_ticks", Dict{Symbol, Any}());
    ohlcvs = self.safeList(assetTicks, lowercase(assetPair), []);
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function fetchMarkOHLCV(self::Mudrex, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOHLCV(symbol, timeframe, since, limit, extend(params, Dict{Symbol, Any}(
    Symbol("price") => "mark"
))))

end
function fetchTicker(self::Mudrex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset_id") => get(market, Symbol("id"), nothing),
        Symbol("is_symbol") => 1
    );
    response = Base.fetch(self.privateGetFuturesAssetId(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTicker(data, market)

end
function fetchTickers(self::Mudrex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetFutures(extend(request, params)));
    data = safeValue(response, "data", []);
    rows = functions.ccxtruthy(functions.ccxt_isArray(data)) ? data : self.safeList(data, "items", []);
    resultTickers = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        t = get(rows, i + 1, nothing);
        sym = safeString(t, "symbol");
        if functions.ccxtruthy(sym == nothing)
            i += 1; continue
        end
        m = self.safeMarket(sym);
        symbol = get(m, Symbol("symbol"), nothing);
        if functions.ccxtruthy(@functions.ccxt_and(symbols != nothing, !functions.ccxtruthy(inArray(symbol, symbols))))
            i += 1; continue
        end
        resultTickers[Symbol(symbol)] = self.parseTicker(t, m);
        i += 1
    end
    return self.filterByArrayTickers(resultTickers, "symbol", symbols)

end
function parseTicker(self::Mudrex, ticker, market=nothing)
    ms = safeString(ticker, "symbol");
    market = self.safeMarket(ms, market);
    symbol = get(market, Symbol("symbol"), nothing);
    ts = milliseconds();
    pct = self.safeNumber(ticker, "change_perc");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => ts,
    Symbol("datetime") => self.iso8601(ts),
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => self.safeNumber(ticker, "last_day_price"),
    Symbol("close") => self.safeNumber(ticker, "price"),
    Symbol("last") => self.safeNumber(ticker, "price"),
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => pct,
    Symbol("average") => nothing,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => self.safeNumber(ticker, "volume"),
    Symbol("info") => ticker
), market)

end
function fetchMarkets(self::Mudrex, params=Dict())
    aggregated = [];
    offset = 0;
    pageLimit = 100;
    paging = true;
    while functions.ccxtruthy(paging)
        q = extend(Dict{Symbol, Any}(
            Symbol("limit") => pageLimit,
            Symbol("offset") => offset
        ), params);
        response = Base.fetch(self.privateGetFutures(q));
        data = safeValue(response, "data", []);
        items = [];
        if functions.ccxtruthy(@functions.ccxt_and(isa(data, Dict), !functions.ccxtruthy(functions.ccxt_isArray(data))))
            items = self.safeList(data, "items", []);
            if functions.ccxtruthy(!functions.ccxtruthy(length(items)))
                items = self.safeList(data, "results", []);
            end
            if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(length(items)), (ccxt_in("symbol", data))))
                items = [data];
            end
        else
            items = toArray(data);
        end
        if functions.ccxtruthy(!functions.ccxtruthy(length(items)))
            paging = false;
            break
        end
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(items)))
            push!(aggregated, get(items, i + 1, nothing));
            i += 1
        end
        if functions.ccxtruthy(functions.ccxt_lt(length(items), pageLimit))
            paging = false;
        else
            offset += pageLimit;
        end
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(aggregated)))
        push!(result, self.parseMarket(get(aggregated, i + 1, nothing)));
        i += 1
    end
    return result

end
function parseMarket(self::Mudrex, asset)
    ms = safeString(asset, "symbol");
    base = ms;
    if functions.ccxtruthy(@functions.ccxt_and(ms != nothing, endswith(ms, "USDT")))
        base = ms[0 + 1:-4];
    end
    quote_var = "USDT";
    settle = "USDT";
    symbol = nothing;
    if functions.ccxtruthy(base != nothing)
        symbol = string(base, "/", quote_var, ":", settle);
    end
    priceStep = safeString(asset, "price_step", "0.01");
    qtyStep = safeString(asset, "quantity_step", "0.001");
    return Dict{Symbol, Any}(
    Symbol("id") => ms,
    Symbol("lowercaseId") => nothing,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => base,
    Symbol("quoteId") => "USDT",
    Symbol("settleId") => "USDT",
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => true,
    Symbol("contract") => true,
    Symbol("linear") => true,
    Symbol("inverse") => false,
    Symbol("taker") => self.safeNumber(get(self.fees, Symbol("trading"), nothing), "taker"),
    Symbol("maker") => self.safeNumber(get(self.fees, Symbol("trading"), nothing), "maker"),
    Symbol("contractSize") => self.safeNumber(asset, "contract_size", 1),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(qtyStep),
        Symbol("price") => self.parseNumber(priceStep)
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(asset, "min_contract"),
            Symbol("max") => self.safeNumber(asset, "max_contract")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(asset, "min_price"),
            Symbol("max") => self.safeNumber(asset, "max_price")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(asset, "min_notional_value"),
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => asset,
    Symbol("created") => nothing
)

end
function fetchBalance(self::Mudrex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params, "swap");
    requested = safeStringN(params, ["trade_currency", "tradeCurrency", "currency"]);
    params = omit(params, ["trade_currency", "tradeCurrency", "currency"]);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(requested != nothing)
            request[Symbol("currency")] = requested;
        end
        response = Base.fetch(self.privateGetWalletFunds(extend(request, params)));
    else
        if functions.ccxtruthy(requested != nothing)
            request[Symbol("trade_currency")] = requested;
        end
        response = Base.fetch(self.privateGetFuturesFunds(extend(request, params)));
    end
    currency = requested;
    if functions.ccxtruthy(currency == nothing)
        currency = "USDT";
    end
    response[Symbol("currency")] = currency;
    return self.parseBalance(response)

end
function parseBalance(self::Mudrex, response)
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    currency = safeString(response, "currency", "USDT");
    timestamp = milliseconds();
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    account = self.account();
    futuresBalance = safeString(data, "balance");
    if functions.ccxtruthy(futuresBalance != nothing)
        account[Symbol("free")] = futuresBalance;
        account[Symbol("used")] = safeString(data, "locked_amount");
    else
        account[Symbol("total")] = safeString(data, "total");
        account[Symbol("free")] = safeString(data, "withdrawable");
    end
    result[Symbol(currency)] = account;
    return self.safeBalance(result)

end
function fetchLeverage(self::Mudrex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset_id") => get(market, Symbol("id"), nothing),
        Symbol("is_symbol") => 1
    );
    response = Base.fetch(self.privateGetFuturesAssetIdLeverage(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => symbol,
    Symbol("marginMode") => safeStringLower(data, "margin_type"),
    Symbol("longLeverage") => self.safeNumber(data, "leverage"),
    Symbol("shortLeverage") => self.safeNumber(data, "leverage")
)

end
function setLeverage(self::Mudrex, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginType = safeString(params, "marginType", "ISOLATED");
    request = Dict{Symbol, Any}(
        Symbol("asset_id") => get(market, Symbol("id"), nothing),
        Symbol("is_symbol") => 1,
        Symbol("margin_type") => marginType,
        Symbol("leverage") => leverage
    );
    params = omit(params, ["marginType"]);
    response = Base.fetch(self.privatePostFuturesAssetIdLeverage(extend(request, params)));
    return response

end
function createOrder(self::Mudrex, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    if functions.ccxtruthy(@functions.ccxt_or((stopLossPrice != nothing), (takeProfitPrice != nothing)))
        positionId = safeString2(params, "positionId", "position_id");
        if functions.ccxtruthy(positionId == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a positionId parameter to place a stopLossPrice or takeProfitPrice order")));
        end
        params = omit(params, ["stopLossPrice", "takeProfitPrice", "positionId", "position_id"]);
        riskRequest = Dict{Symbol, Any}(
            Symbol("position_id") => positionId
        );
        if functions.ccxtruthy(takeProfitPrice != nothing)
            riskRequest[Symbol("is_takeprofit")] = true;
            riskRequest[Symbol("takeprofit_price")] = self.priceToPrecision(symbol, takeProfitPrice);
        end
        if functions.ccxtruthy(stopLossPrice != nothing)
            riskRequest[Symbol("is_stoploss")] = true;
            riskRequest[Symbol("stoploss_price")] = self.priceToPrecision(symbol, stopLossPrice);
        end
        riskResponse = Base.fetch(self.privatePostFuturesPositionsPositionIdRiskorder(extend(riskRequest, params)));
        riskData = self.safeDict(riskResponse, "data", riskResponse);
            return self.parseOrder(riskData, market)
    end
    lev = safeInteger(params, "leverage", 1);
    if functions.ccxtruthy(@functions.ccxt_and((type_var == "market"), (price == nothing)))
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for market orders")));
    end
    request = Dict{Symbol, Any}(
        Symbol("asset_id") => get(market, Symbol("id"), nothing),
        Symbol("is_symbol") => 1,
        Symbol("leverage") => numberToString(lev),
        Symbol("quantity") => self.amountToPrecision(symbol, amount),
        Symbol("order_price") => self.priceToPrecision(symbol, price),
        Symbol("order_type") => functions.ccxtruthy((side == "buy")) ? "LONG" : "SHORT",
        Symbol("trigger_type") => functions.ccxtruthy((type_var == "market")) ? "MARKET" : "LIMIT",
        Symbol("reduce_only") => self.safeBool(params, "reduceOnly", false)
    );
    takeProfit = self.safeDict(params, "takeProfit");
    stopLoss = self.safeDict(params, "stopLoss");
    if functions.ccxtruthy(takeProfit != nothing)
        request[Symbol("is_takeprofit")] = true;
        request[Symbol("takeprofit_price")] = self.priceToPrecision(symbol, safeStringN(takeProfit, ["triggerPrice", "stopPrice", "price"]));
    end
    if functions.ccxtruthy(stopLoss != nothing)
        request[Symbol("is_stoploss")] = true;
        request[Symbol("stoploss_price")] = self.priceToPrecision(symbol, safeStringN(stopLoss, ["triggerPrice", "stopPrice", "price"]));
    end
    params = omit(params, ["leverage", "reduceOnly", "takeProfit", "stopLoss"]);
    response = Base.fetch(self.privatePostFuturesAssetIdOrder(extend(request, params)));
    data = self.safeDict(response, "data", response);
    data[Symbol("order_type")] = get(request, Symbol("order_type"), nothing);
    data[Symbol("trigger_type")] = get(request, Symbol("trigger_type"), nothing);
    return self.parseOrder(data, market)

end
function editOrder(self::Mudrex, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("order_price")] = self.priceToPrecision(symbol, price);
    end
    response = Base.fetch(self.privatePatchFuturesOrdersOrderId(extend(request, params)));
    data = self.safeDict(response, "data", response);
    return self.parseOrder(data, market)

end
function parseOrderStatus(self::Mudrex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("open") => "open",
        Symbol("created") => "open",
        Symbol("new") => "open",
        Symbol("pending") => "open",
        Symbol("partially_filled") => "open",
        Symbol("filled") => "closed",
        Symbol("completed") => "closed",
        Symbol("cancelled") => "canceled",
        Symbol("canceled") => "canceled",
        Symbol("rejected") => "rejected",
        Symbol("expired") => "expired"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Mudrex, order, market=nothing)
    oms = safeString(order, "symbol");
    market = self.safeMarket(oms, market);
    oid = safeString2(order, "order_id", "id");
    rawSide = safeStringUpper(order, "order_type");
    side = nothing;
    if functions.ccxtruthy(rawSide == "LONG")
        side = "buy";
    elseif functions.ccxtruthy(rawSide == "SHORT")
        side = "sell";
    end
    trig = safeStringUpper(order, "trigger_type");
    typ = nothing;
    if functions.ccxtruthy(trig == "MARKET")
        typ = "market";
    elseif functions.ccxtruthy(trig == "LIMIT")
        typ = "limit";
    end
    ts = self.parse8601(safeString(order, "created_at"));
    if functions.ccxtruthy(ts == nothing)
        ts = milliseconds();
    end
    status = self.parseOrderStatus(safeStringLower(order, "status"));
    sym = get(market, Symbol("symbol"), nothing);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => oid,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => ts,
    Symbol("datetime") => self.iso8601(ts),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => sym,
    Symbol("type") => typ,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => self.safeNumber2(order, "price", "order_price"),
    Symbol("stopPrice") => nothing,
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => self.safeNumber2(order, "quantity", "amount"),
    Symbol("cost") => nothing,
    Symbol("average") => nothing,
    Symbol("filled") => nothing,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("trades") => [],
    Symbol("fees") => [],
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("reduceOnly") => self.safeBool(order, "reduce_only")
), market)

end
function cancelOrder(self::Mudrex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateDeleteFuturesOrdersOrderId(extend(request, params)));
    data = self.safeDict(response, "data", response);
    return self.parseOrder(data, market)

end
function fetchOrder(self::Mudrex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateGetFuturesOrdersOrderId(extend(request, params)));
    data = self.safeDict(response, "data", response);
    return self.parseOrder(data, market)

end
function fetchOrdersByState(self::Mudrex, state, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    q = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        q[Symbol("limit")] = limit;
    end
    request = extend(q, params);
    response = nothing;
    if functions.ccxtruthy(state == "closed")
        response = Base.fetch(self.privateGetFuturesOrdersHistory(request));
    else
        response = Base.fetch(self.privateGetFuturesOrders(request));
    end
    data = safeValue(response, "data", []);
    rows = toArray(data);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        push!(orders, self.parseOrder(get(rows, i + 1, nothing), market));
        i += 1
    end
    return self.filterBySymbolSinceLimit(orders, symbol, since, limit)

end
function fetchOrders(self::Mudrex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState("closed", symbol, since, limit, params))

end
function fetchOpenOrders(self::Mudrex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState("open", symbol, since, limit, params))

end
function fetchClosedOrders(self::Mudrex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState("closed", symbol, since, limit, params))

end
function fetchPositions(self::Mudrex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    q = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetFuturesPositions(extend(q, params)));
    data = safeValue(response, "data", []);
    if functions.ccxtruthy(data == nothing)
            return []
    end
    rows = toArray(data);
    outPos = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        p = get(rows, i + 1, nothing);
        symRaw = safeString(p, "symbol");
        m = self.safeMarket(symRaw);
        pos = self.parsePosition(p, m);
        push!(outPos, pos);
        i += 1
    end
    return self.filterByArrayPositions(outPos, "symbol", symbols, false)

end
function fetchPositionsHistory(self::Mudrex, symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetFuturesPositionsHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    positions = self.parsePositions(data, symbols);
    return self.filterBySinceLimit(positions, since, limit)

end
function parsePosition(self::Mudrex, position, market=nothing)
    market = self.safeMarket(nothing, market);
    ms = safeString(position, "symbol");
    symbol = self.safeSymbol(ms, market);
    rawSide = safeStringUpper2(position, "order_type", "position_type");
    side = nothing;
    if functions.ccxtruthy(rawSide == "LONG")
        side = "long";
    elseif functions.ccxtruthy(rawSide == "SHORT")
        side = "short";
    end
    ts = self.parse8601(safeString(position, "updated_at"));
    if functions.ccxtruthy(ts == nothing)
        ts = self.parse8601(safeString(position, "created_at"));
    end
    quantityString = safeString(position, "quantity");
    entryPriceString = safeString(position, "entry_price");
    contractSizeString = safeString(market, "contractSize", "1");
    notional = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((quantityString != nothing), (entryPriceString != nothing)))
        notional = self.parseNumber(stringMul(stringMul(quantityString, entryPriceString), contractSizeString));
    end
    initialMargin = safeString(position, "initial_margin");
    return Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "id"),
    Symbol("symbol") => symbol,
    Symbol("timestamp") => ts,
    Symbol("datetime") => self.iso8601(ts),
    Symbol("isolated") => true,
    Symbol("hedged") => false,
    Symbol("side") => side,
    Symbol("contracts") => self.safeNumber(position, "quantity"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("entryPrice") => self.safeNumber(position, "entry_price"),
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => self.safeNumber(position, "closed_price"),
    Symbol("notional") => notional,
    Symbol("leverage") => safeInteger(position, "leverage"),
    Symbol("collateral") => self.parseNumber(initialMargin),
    Symbol("initialMargin") => self.parseNumber(initialMargin),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => self.safeNumber(position, "maintenance_margin"),
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => nothing,
    Symbol("realizedPnl") => self.safeNumber(position, "pnl"),
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidation_price"),
    Symbol("marginMode") => "isolated",
    Symbol("percentage") => nothing
)

end
function closePosition(self::Mudrex, symbol, side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    positionId = safeString(params, "position_id");
    amount = safeValue(params, "amount");
    if functions.ccxtruthy(positionId == nothing)
        market = self.market(symbol);
        positions = Base.fetch(self.fetchPositions([symbol], params));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
            p = get(positions, i + 1, nothing);
            if functions.ccxtruthy(@functions.ccxt_and(side != nothing, get(p, Symbol("side"), nothing) != side))
                i += 1; continue
            end
            if functions.ccxtruthy(get(p, Symbol("symbol"), nothing) == get(market, Symbol("symbol"), nothing))
                positionId = safeString(p, "id");
                break
            end
            i += 1
        end

    end
    if functions.ccxtruthy(positionId == nothing)
        throw(OrderNotFound(string(self.id, " closePosition() could not resolve position_id")));
    end
    request = Dict{Symbol, Any}(
        Symbol("position_id") => positionId
    );
    if functions.ccxtruthy(amount != nothing)
        orderType = safeStringUpper(params, "order_type", "LIMIT");
        request[Symbol("order_type")] = orderType;
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        lp = safeString(params, "limit_price");
        if functions.ccxtruthy(@functions.ccxt_and(orderType == "LIMIT", lp != nothing))
            request[Symbol("limit_price")] = lp;
        end
        params = omit(params, ["order_type", "limit_price", "amount", "position_id"]);
            return Base.fetch(self.privatePostFuturesPositionsPositionIdClosePartial(extend(request, params)))
    end
    params = omit(params, ["position_id"]);
    return Base.fetch(self.privatePostFuturesPositionsPositionIdClose(extend(request, params)))

end
function addMargin(self::Mudrex, symbol, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    positionId = safeString(params, "position_id");
    if functions.ccxtruthy(positionId == nothing)
        positions = Base.fetch(self.fetchPositions([symbol], params));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
            p = get(positions, i + 1, nothing);
            if functions.ccxtruthy(get(p, Symbol("symbol"), nothing) == symbol)
                positionId = safeString(p, "id");
                break
            end
            i += 1
        end

    end
    if functions.ccxtruthy(positionId == nothing)
        throw(OrderNotFound(string(self.id, " addMargin() could not resolve position_id")));
    end
    request = Dict{Symbol, Any}(
        Symbol("position_id") => positionId,
        Symbol("margin") => self.costToPrecision(symbol, amount)
    );
    params = omit(params, ["position_id"]);
    return Base.fetch(self.privatePostFuturesPositionsPositionIdAddMargin(extend(request, params)))

end
function reduceMargin(self::Mudrex, symbol, amount, params=Dict())
    return Base.fetch(self.addMargin(symbol, -amount, params))

end
function fetchMyTrades(self::Mudrex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetFuturesFeeHistory(extend(request, params)));
    data = safeValue(response, "data", []);
    rows = toArray(data);
    return self.parseTrades(rows, market, since, limit)

end
function parseTrade(self::Mudrex, trade, market=nothing)
    ms = safeString(trade, "symbol");
    market = self.safeMarket(ms, market);
    symbol = get(market, Symbol("symbol"), nothing);
    ts = self.parse8601(safeString(trade, "created_at"));
    if functions.ccxtruthy(ts == nothing)
        ts = safeInteger(trade, "time");
    end
    side = safeStringLower2(trade, "side", "order_type");
    tradeSide = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(side == "buy", side == "long"))
        tradeSide = "buy";
    elseif functions.ccxtruthy(@functions.ccxt_or(side == "sell", side == "short"))
        tradeSide = "sell";
    end
    feeType = safeStringUpper(trade, "fee_type");
    takerOrMaker = nothing;
    if functions.ccxtruthy(feeType == "TRANSACTION")
        takerOrMaker = "taker";
    elseif functions.ccxtruthy(feeType == "REBATE")
        takerOrMaker = "maker";
    end
    fee = nothing;
    feeCost = self.safeNumber(trade, "fee_amount");
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => safeString(trade, "trade_currency")
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => ts,
    Symbol("datetime") => self.iso8601(ts),
    Symbol("symbol") => symbol,
    Symbol("id") => safeString2(trade, "execId", "id"),
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("type") => safeStringLower(trade, "trigger_type"),
    Symbol("side") => tradeSide,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => self.safeNumber(trade, "price"),
    Symbol("amount") => self.safeNumber2(trade, "size", "quantity"),
    Symbol("cost") => self.safeNumber(trade, "transaction_amount"),
    Symbol("fee") => fee
), market)

end
function transfer(self::Mudrex, code, amount, fromAccount, toAccount, params=Dict())
    mp = Dict{Symbol, Any}(
        Symbol("spot") => "SPOT",
        Symbol("SPOT") => "SPOT",
        Symbol("futures") => "FUTURES",
        Symbol("future") => "FUTURES",
        Symbol("FUTURES") => "FUTURES"
    );
    fw = safeString(mp, fromAccount, uppercase(fromAccount));
    tw = safeString(mp, toAccount, uppercase(toAccount));
    body = Dict{Symbol, Any}(
        Symbol("from_wallet_type") => fw,
        Symbol("to_wallet_type") => tw,
        Symbol("amount") => numberToString(amount)
    );
    useInr = false;
    if functions.ccxtruthy(code == "INR")
        useInr = true;
    else
        tradeCurrency = safeString2(params, "trade_currency", "tradeCurrency");
        if functions.ccxtruthy(tradeCurrency == "INR")
            useInr = true;
        end
    end
    response = nothing;
    if functions.ccxtruthy(useInr)
        response = Base.fetch(self.privatePostFuturesTransfersInr(extend(body, params)));
    else
        response = Base.fetch(self.privatePostWalletFuturesTransfer(extend(body, params)));
    end
    data = self.safeDict(response, "data", response);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => safeString(data, "id"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("fromAccount") => fw,
    Symbol("toAccount") => tw,
    Symbol("status") => "ok"
)

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Mudrex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function marketGetPriceKline(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "price/kline", "market", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function marketGetPriceMarkKline(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "price/mark-kline", "market", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFutures(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFuturesAssetId(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/{asset_id}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetWalletFunds(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "wallet/funds", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetFuturesFunds(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/funds", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetFuturesOrders(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFuturesOrdersHistory(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFuturesOrdersOrderId(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders/{order_id}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFuturesPositions(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFuturesPositionsHistory(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFuturesFeeHistory(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/fee/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFuturesAssetIdLeverage(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/{asset_id}/leverage", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privateGetFuturesPositionsPositionIdLiqPrice(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/liq-price", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostWalletFuturesTransfer(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "wallet/futures/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostFuturesTransfersInr(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/transfers/inr", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostFuturesAssetIdOrder(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/{asset_id}/order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privatePostFuturesPositionsPositionIdClose(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/close", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privatePostFuturesPositionsPositionIdClosePartial(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/close/partial", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privatePostFuturesPositionsPositionIdReverse(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/reverse", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privatePostFuturesPositionsPositionIdAddMargin(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/add-margin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privatePostFuturesPositionsPositionIdRiskorder(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/riskorder", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privatePostFuturesAssetIdLeverage(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/{asset_id}/leverage", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privatePatchFuturesOrdersOrderId(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders/{order_id}", "private", "PATCH", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePatchFuturesPositionsPositionIdRiskorder(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/riskorder", "private", "PATCH", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function privateDeleteFuturesOrdersOrderId(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders/{order_id}", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 2))
end

function Mudrex(; kwargs...)
    inst = Mudrex(Exchange(), describe, sign, handleErrors, parseOHLCV, fetchOHLCV, fetchMarkOHLCV, fetchTicker, fetchTickers, parseTicker, fetchMarkets, parseMarket, fetchBalance, parseBalance, fetchLeverage, setLeverage, createOrder, editOrder, parseOrderStatus, parseOrder, cancelOrder, fetchOrder, fetchOrdersByState, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchPositions, fetchPositionsHistory, parsePosition, closePosition, addMargin, reduceMargin, fetchMyTrades, parseTrade, transfer, marketGetPriceKline, marketGetPriceMarkKline, privateGetFutures, privateGetFuturesAssetId, privateGetWalletFunds, privateGetFuturesFunds, privateGetFuturesOrders, privateGetFuturesOrdersHistory, privateGetFuturesOrdersOrderId, privateGetFuturesPositions, privateGetFuturesPositionsHistory, privateGetFuturesFeeHistory, privateGetFuturesAssetIdLeverage, privateGetFuturesPositionsPositionIdLiqPrice, privatePostWalletFuturesTransfer, privatePostFuturesTransfersInr, privatePostFuturesAssetIdOrder, privatePostFuturesPositionsPositionIdClose, privatePostFuturesPositionsPositionIdClosePartial, privatePostFuturesPositionsPositionIdReverse, privatePostFuturesPositionsPositionIdAddMargin, privatePostFuturesPositionsPositionIdRiskorder, privatePostFuturesAssetIdLeverage, privatePatchFuturesOrdersOrderId, privatePatchFuturesPositionsPositionIdRiskorder, privateDeleteFuturesOrdersOrderId)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
