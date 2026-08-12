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
                Symbol("price/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("price/mark-kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}()
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/{asset_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wallet/funds") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("futures/funds") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("futures/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/orders/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/positions/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/fee/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/{asset_id}/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("futures/positions/{position_id}/liq-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("wallet/futures/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("futures/transfers/inr") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("futures/{asset_id}/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("futures/positions/{position_id}/close") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("futures/positions/{position_id}/close/partial") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("futures/positions/{position_id}/reverse") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("futures/positions/{position_id}/add-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("futures/positions/{position_id}/riskorder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("futures/{asset_id}/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
            ),
            Symbol("patch") => Dict{Symbol, Any}(
                Symbol("futures/orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/positions/{position_id}/riskorder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("futures/orders/{order_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
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
function sign(self::Mudrex, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    apiUrls = self.safeDict(self.urls, "api", defaultValue = Dict{Symbol, Any}());
    base = safeString(apiUrls, api);
    if functions.ccxtruthy(base == nothing)
        throw(ExchangeError(string(self.id, " unknown API namespace: ", api)));
    end
    url = string(base, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    requestHeaders = Dict{Symbol, Any}();
    if functions.ccxtruthy(headers != nothing)
        requestHeaders = extend(Dict{Symbol, Any}(), headers);
    end
    brokerId = safeString(self.options, "broker");
    if functions.ccxtruthy(brokerId != nothing)
        requestHeaders[Symbol("Partner-Id")] = brokerId;
    end
    methodUpper = uppercase(method);
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        requestHeaders[Symbol("X-Authentication")] = self.secret;
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(methodUpper == "POST", methodUpper == "PATCH"), methodUpper == "DELETE"))
            requestHeaders[Symbol("Content-Type")] = "application/json";
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
    Symbol("headers") => requestHeaders
)
            end
            bodyStr = json(query);
                return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => methodUpper,
    Symbol("body") => bodyStr,
    Symbol("headers") => requestHeaders
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
    Symbol("headers") => requestHeaders
)

end
function handleErrors(self::Mudrex, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or(response == nothing, !isa(response, Dict)))
            return nothing
    end
    success = self.safeBool(response, "success", defaultValue = true);
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        errors = self.safeList(response, "errors", defaultValue = []);
        first_var = self.safeDict(errors, 0, defaultValue = Dict{Symbol, Any}());
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
function parseOHLCV(self::Mudrex, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.trade.mudrex.com/docs/historical-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.price`::string, optional: "mark" to fetch mark price candles

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Mudrex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    if functions.ccxtruthy(startTime == nothing)
        throw(ExchangeError(string(self.id, " fetchOHLCV() missing startTime")));
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    assetTicks = self.safeDict(data, "asset_ticks", defaultValue = Dict{Symbol, Any}());
    ohlcvs = self.safeList(assetTicks, lowercase(assetPair), defaultValue = []);
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
fetches historical mark price candlestick data containing the open, high, low, and close price of a market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchMarkOHLCV(self::Mudrex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = extend(params, Dict{Symbol, Any}(
    Symbol("price") => "mark"
))))

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
"""
function fetchTicker(self::Mudrex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset_id") => get(market, Symbol("id"), nothing),
        Symbol("is_symbol") => 1
    );
    response = Base.fetch(self.privateGetFuturesAssetId(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(data, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
"""
function fetchTickers(self::Mudrex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetFutures(extend(request, params)));
    data = safeValue(response, "data", []);
    rows = functions.ccxtruthy(functions.ccxt_isArray(data)) ? data : self.safeList(data, "items", defaultValue = []);
    resultTickers = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        t = get(rows, i + 1, nothing);
        sym = safeString(t, "symbol");
        if functions.ccxtruthy(sym == nothing)
            i += 1; continue
        end
        m = self.safeMarket(marketId = sym);
        symbol = get(m, Symbol("symbol"), nothing);
        if functions.ccxtruthy(@functions.ccxt_and(symbols != nothing, !functions.ccxtruthy(inArray(symbol, symbols))))
            i += 1; continue
        end
        resultTickers[Symbol(symbol)] = self.parseTicker(t, market = m);
        i += 1
    end
    return self.filterByArrayTickers(resultTickers, "symbol", values = symbols)

end
function parseTicker(self::Mudrex, ticker; market=nothing)
    ms = safeString(ticker, "symbol");
    market = self.safeMarket(marketId = ms, market = market);
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
), market = market)

end
"""
retrieves data on all markets for the exchange
see: https://docs.trade.mudrex.com/docs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Mudrex; params=Dict())
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
            items = self.safeList(data, "items", defaultValue = []);
            itemsLength = length(items);
            if functions.ccxtruthy(!functions.ccxtruthy(itemsLength))
                items = self.safeList(data, "results", defaultValue = []);
                itemsLength = length(items);
            end
            if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(itemsLength), (ccxt_in("symbol", data))))
                items = [data];
            end
        else
            items = toArray(data);
        end
        numItems = length(items);
        if functions.ccxtruthy(!functions.ccxtruthy(numItems))
            paging = false;
            break
        end
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, numItems))
            push!(aggregated, get(items, i + 1, nothing));
            i += 1
        end
        if functions.ccxtruthy(functions.ccxt_lt(numItems, pageLimit))
            paging = false;
        else
            offset = self.sum(offset, pageLimit);
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
        base = functions.ccxt_slice(ms, 0, -4);
    end
    quote_var = "USDT";
    settle = "USDT";
    symbol = nothing;
    if functions.ccxtruthy(base != nothing)
        symbol = string(base, "/", quote_var, ":", settle);
    end
    priceStep = safeString(asset, "price_step", "0.01");
    qtyStep = safeString(asset, "quantity_step", "0.001");
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
    Symbol("contractSize") => self.safeNumber(asset, "contract_size", defaultNumber = 1),
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
))

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.trade.mudrex.com/docs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'swap' (default) or 'spot' - which wallet balance to fetch
- `params.trade_currency`::string, optional: the settlement currency to query the balance for

# Returns
- a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
"""
function fetchBalance(self::Mudrex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params, defaultValue = "swap");
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
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " fetchBalance() returned empty response")));
    end
    response[Symbol("currency")] = currency;
    return self.parseBalance(response)

end
function parseBalance(self::Mudrex, response)
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
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
"""
fetch the set leverage for a market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)
"""
function fetchLeverage(self::Mudrex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset_id") => get(market, Symbol("id"), nothing),
        Symbol("is_symbol") => 1
    );
    response = Base.fetch(self.privateGetFuturesAssetIdLeverage(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => symbol,
    Symbol("marginMode") => safeStringLower(data, "margin_type"),
    Symbol("longLeverage") => self.safeNumber(data, "leverage"),
    Symbol("shortLeverage") => self.safeNumber(data, "leverage")
)

end
"""
set the level of leverage for a market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginType`::string, optional: 'ISOLATED' (default) or 'CROSSED'

# Returns
- response from the exchange
"""
function setLeverage(self::Mudrex, leverage; symbol=nothing, params=Dict())
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
"""
create a trade order
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified market symbol
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price to fulfill the order, in units of the quote currency (also required for market orders on this exchange)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::int, optional: leverage for the order, required if setLeverage() was not called beforehand
- `params.reduceOnly`::bool, optional: true if the order is reduce only
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the trigger price of the take-profit order attached to this order
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the trigger price of the stop-loss order attached to this order
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.takeProfitPrice`::float, optional: the trigger price for a standalone take-profit order on an existing position (requires params.positionId)
- `params.stopLossPrice`::float, optional: the trigger price for a standalone stop-loss order on an existing position (requires params.positionId)
- `params.positionId`::string, optional: the id of the position the standalone stopLossPrice/takeProfitPrice order is attached to
- `params.trade_currency`::string, optional: the settlement currency for the order

# Returns
- an [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
function createOrder(self::Mudrex, symbol, type_var, side, amount; price=nothing, params=Dict())
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
        riskData = self.safeDict(riskResponse, "data", defaultValue = riskResponse);
            return self.parseOrder(riskData, market = market)
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
        Symbol("reduce_only") => self.safeBool(params, "reduceOnly", defaultValue = false)
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
    data = self.safeDict(response, "data", defaultValue = response);
    data[Symbol("order_type")] = get(request, Symbol("order_type"), nothing);
    data[Symbol("trigger_type")] = get(request, Symbol("trigger_type"), nothing);
    return self.parseOrder(data, market = market)

end
"""
edit a trade order
see: https://docs.trade.mudrex.com/docs

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to edit an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
function editOrder(self::Mudrex, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = response);
    return self.parseOrder(data, market = market)

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
function parseOrder(self::Mudrex, order; market=nothing)
    oms = safeString(order, "symbol");
    market = self.safeMarket(marketId = oms, market = market);
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
), market = market)

end
"""
cancels an open order
see: https://docs.trade.mudrex.com/docs

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
function cancelOrder(self::Mudrex, id; symbol=nothing, params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = response);
    return self.parseOrder(data, market = market)

end
"""
fetches information on an order made by the user
see: https://docs.trade.mudrex.com/docs

# Arguments
- `id`::string: the order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
function fetchOrder(self::Mudrex, id; symbol=nothing, params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = response);
    return self.parseOrder(data, market = market)

end
"""
fetches a list of orders filtered by their state

# Arguments
- `state`::string: the state of the orders to fetch
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
"""
function fetchOrdersByState(self::Mudrex, state; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        push!(orders, self.parseOrder(get(rows, i + 1, nothing), market = market));
        i += 1
    end
    return self.filterBySymbolSinceLimit(orders, symbol = symbol, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
"""
function fetchOrders(self::Mudrex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState("closed", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetch all unfilled currently open orders
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
"""
function fetchOpenOrders(self::Mudrex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState("open", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple closed orders made by the user
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
"""
function fetchClosedOrders(self::Mudrex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByState("closed", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetch all open positions
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trade_currency`::string, optional: the settlement currency to query positions for

# Returns
- a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
"""
function fetchPositions(self::Mudrex; symbols=nothing, params=Dict())
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
        m = self.safeMarket(marketId = symRaw);
        pos = self.parsePosition(p, market = m);
        push!(outPos, pos);
        i += 1
    end
    return self.filterByArrayPositions(outPos, "symbol", values = symbols, indexed = false)

end
"""
fetches the history of closed positions
see: https://docs.trade.mudrex.com/docs/get-position-history

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum number of position structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trade_currency`::string, optional: the settlement currency to filter positions by

# Returns
- a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
"""
function fetchPositionsHistory(self::Mudrex; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetFuturesPositionsHistory(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    positions = self.parsePositions(data, symbols = symbols);
    return self.filterBySinceLimit(positions, since = since, limit = limit)

end
function parsePosition(self::Mudrex, position; market=nothing)
    market = self.safeMarket(marketId = nothing, market = market);
    ms = safeString(position, "symbol");
    symbol = self.safeSymbol(ms, market = market);
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
"""
closes an open position for a market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified CCXT market symbol
- `side`::string, optional: 'buy' or 'sell', not required by mudrex
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.position_id`::string, optional: the id of the position to close, resolved from the symbol if not provided
- `params.amount`::float, optional: the amount to close for a partial close, closes the whole position if not provided

# Returns
- an [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
function closePosition(self::Mudrex, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    positionId = safeString(params, "position_id");
    amount = safeValue(params, "amount");
    if functions.ccxtruthy(positionId == nothing)
        market = self.market(symbol);
        positions = Base.fetch(self.fetchPositions(symbols = [symbol], params = params));
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
        partialResponse = Base.fetch(self.privatePostFuturesPositionsPositionIdClosePartial(extend(request, params)));
            return partialResponse
    end
    params = omit(params, ["position_id"]);
    response = Base.fetch(self.privatePostFuturesPositionsPositionIdClose(extend(request, params)));
    return response

end
"""
add margin to a position
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.position_id`::string, optional: the id of the position to add margin to, resolved from the symbol if not provided

# Returns
- a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)
"""
function addMargin(self::Mudrex, symbol, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    positionId = safeString(params, "position_id");
    if functions.ccxtruthy(positionId == nothing)
        positions = Base.fetch(self.fetchPositions(symbols = [symbol], params = params));
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
    response = Base.fetch(self.privatePostFuturesPositionsPositionIdAddMargin(extend(request, params)));
    return response

end
"""
remove margin from a position
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)
"""
function reduceMargin(self::Mudrex, symbol, amount; params=Dict())
    return Base.fetch(self.addMargin(symbol, -amount, params = params))

end
"""
fetch all trades made by the user
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trade_currency`::string, optional: the settlement currency to filter trades by

# Returns
- a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
"""
function fetchMyTrades(self::Mudrex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTrades(rows, market = market, since = since, limit = limit)

end
function parseTrade(self::Mudrex, trade; market=nothing)
    ms = safeString(trade, "symbol");
    market = self.safeMarket(marketId = ms, market = market);
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
), market = market)

end
"""
transfer currency internally between wallets on the same account
see: https://docs.trade.mudrex.com/docs

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: 'spot' or 'futures'
- `toAccount`::string: 'spot' or 'futures'
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)
"""
function transfer(self::Mudrex, code, amount, fromAccount, toAccount; params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = response);
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Mudrex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function marketGetPriceKline(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "price/kline"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function marketGetPriceMarkKline(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "price/mark-kline"; api="market", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFutures(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesAssetId(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/{asset_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWalletFunds(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "wallet/funds"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesFunds(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/funds"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesOrders(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesOrdersHistory(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesOrdersOrderId(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders/{order_id}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesPositions(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesPositionsHistory(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesFeeHistory(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/fee/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesAssetIdLeverage(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/{asset_id}/leverage"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFuturesPositionsPositionIdLiqPrice(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/liq-price"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWalletFuturesTransfer(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "wallet/futures/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesTransfersInr(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/transfers/inr"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesAssetIdOrder(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/{asset_id}/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesPositionsPositionIdClose(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/close"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesPositionsPositionIdClosePartial(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/close/partial"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesPositionsPositionIdReverse(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/reverse"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesPositionsPositionIdAddMargin(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/add-margin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesPositionsPositionIdRiskorder(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/riskorder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFuturesAssetIdLeverage(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/{asset_id}/leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePatchFuturesOrdersOrderId(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders/{order_id}"; api="private", method="PATCH", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePatchFuturesPositionsPositionIdRiskorder(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/positions/{position_id}/riskorder"; api="private", method="PATCH", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteFuturesOrdersOrderId(self::Mudrex, params=Dict(), context=Dict())
    return request(self, "futures/orders/{order_id}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Mudrex(; kwargs...)
    inst = Mudrex(Exchange(), describe, sign, handleErrors, parseOHLCV, fetchOHLCV, fetchMarkOHLCV, fetchTicker, fetchTickers, parseTicker, fetchMarkets, parseMarket, fetchBalance, parseBalance, fetchLeverage, setLeverage, createOrder, editOrder, parseOrderStatus, parseOrder, cancelOrder, fetchOrder, fetchOrdersByState, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchPositions, fetchPositionsHistory, parsePosition, closePosition, addMargin, reduceMargin, fetchMyTrades, parseTrade, transfer, marketGetPriceKline, marketGetPriceMarkKline, privateGetFutures, privateGetFuturesAssetId, privateGetWalletFunds, privateGetFuturesFunds, privateGetFuturesOrders, privateGetFuturesOrdersHistory, privateGetFuturesOrdersOrderId, privateGetFuturesPositions, privateGetFuturesPositionsHistory, privateGetFuturesFeeHistory, privateGetFuturesAssetIdLeverage, privateGetFuturesPositionsPositionIdLiqPrice, privatePostWalletFuturesTransfer, privatePostFuturesTransfersInr, privatePostFuturesAssetIdOrder, privatePostFuturesPositionsPositionIdClose, privatePostFuturesPositionsPositionIdClosePartial, privatePostFuturesPositionsPositionIdReverse, privatePostFuturesPositionsPositionIdAddMargin, privatePostFuturesPositionsPositionIdRiskorder, privatePostFuturesAssetIdLeverage, privatePatchFuturesOrdersOrderId, privatePatchFuturesPositionsPositionIdRiskorder, privateDeleteFuturesOrdersOrderId)
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
function __ccxt_doc_Mudrex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.trade.mudrex.com/docs/historical-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.price`::string, optional: "mark" to fetch mark price candles

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Mudrex_fetchOHLCV

function __ccxt_doc_Mudrex_fetchMarkOHLCV() end
"""
fetches historical mark price candlestick data containing the open, high, low, and close price of a market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Mudrex_fetchMarkOHLCV

function __ccxt_doc_Mudrex_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
"""
__ccxt_doc_Mudrex_fetchTicker

function __ccxt_doc_Mudrex_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
"""
__ccxt_doc_Mudrex_fetchTickers

function __ccxt_doc_Mudrex_fetchMarkets() end
"""
retrieves data on all markets for the exchange
see: https://docs.trade.mudrex.com/docs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Mudrex_fetchMarkets

function __ccxt_doc_Mudrex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.trade.mudrex.com/docs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'swap' (default) or 'spot' - which wallet balance to fetch
- `params.trade_currency`::string, optional: the settlement currency to query the balance for

# Returns
- a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
"""
__ccxt_doc_Mudrex_fetchBalance

function __ccxt_doc_Mudrex_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)
"""
__ccxt_doc_Mudrex_fetchLeverage

function __ccxt_doc_Mudrex_setLeverage() end
"""
set the level of leverage for a market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginType`::string, optional: 'ISOLATED' (default) or 'CROSSED'

# Returns
- response from the exchange
"""
__ccxt_doc_Mudrex_setLeverage

function __ccxt_doc_Mudrex_createOrder() end
"""
create a trade order
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified market symbol
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price to fulfill the order, in units of the quote currency (also required for market orders on this exchange)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::int, optional: leverage for the order, required if setLeverage() was not called beforehand
- `params.reduceOnly`::bool, optional: true if the order is reduce only
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the trigger price of the take-profit order attached to this order
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the trigger price of the stop-loss order attached to this order
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.takeProfitPrice`::float, optional: the trigger price for a standalone take-profit order on an existing position (requires params.positionId)
- `params.stopLossPrice`::float, optional: the trigger price for a standalone stop-loss order on an existing position (requires params.positionId)
- `params.positionId`::string, optional: the id of the position the standalone stopLossPrice/takeProfitPrice order is attached to
- `params.trade_currency`::string, optional: the settlement currency for the order

# Returns
- an [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_createOrder

function __ccxt_doc_Mudrex_editOrder() end
"""
edit a trade order
see: https://docs.trade.mudrex.com/docs

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to edit an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_editOrder

function __ccxt_doc_Mudrex_cancelOrder() end
"""
cancels an open order
see: https://docs.trade.mudrex.com/docs

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_cancelOrder

function __ccxt_doc_Mudrex_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.trade.mudrex.com/docs

# Arguments
- `id`::string: the order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_fetchOrder

function __ccxt_doc_Mudrex_fetchOrdersByState() end
"""
fetches a list of orders filtered by their state

# Arguments
- `state`::string: the state of the orders to fetch
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_fetchOrdersByState

function __ccxt_doc_Mudrex_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_fetchOrders

function __ccxt_doc_Mudrex_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_fetchOpenOrders

function __ccxt_doc_Mudrex_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_fetchClosedOrders

function __ccxt_doc_Mudrex_fetchPositions() end
"""
fetch all open positions
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trade_currency`::string, optional: the settlement currency to query positions for

# Returns
- a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
"""
__ccxt_doc_Mudrex_fetchPositions

function __ccxt_doc_Mudrex_fetchPositionsHistory() end
"""
fetches the history of closed positions
see: https://docs.trade.mudrex.com/docs/get-position-history

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum number of position structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trade_currency`::string, optional: the settlement currency to filter positions by

# Returns
- a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
"""
__ccxt_doc_Mudrex_fetchPositionsHistory

function __ccxt_doc_Mudrex_closePosition() end
"""
closes an open position for a market
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified CCXT market symbol
- `side`::string, optional: 'buy' or 'sell', not required by mudrex
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.position_id`::string, optional: the id of the position to close, resolved from the symbol if not provided
- `params.amount`::float, optional: the amount to close for a partial close, closes the whole position if not provided

# Returns
- an [order structure](https://docs.ccxt.com/#/?id=order-structure)
"""
__ccxt_doc_Mudrex_closePosition

function __ccxt_doc_Mudrex_addMargin() end
"""
add margin to a position
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.position_id`::string, optional: the id of the position to add margin to, resolved from the symbol if not provided

# Returns
- a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)
"""
__ccxt_doc_Mudrex_addMargin

function __ccxt_doc_Mudrex_reduceMargin() end
"""
remove margin from a position
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)
"""
__ccxt_doc_Mudrex_reduceMargin

function __ccxt_doc_Mudrex_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.trade.mudrex.com/docs

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trade_currency`::string, optional: the settlement currency to filter trades by

# Returns
- a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
"""
__ccxt_doc_Mudrex_fetchMyTrades

function __ccxt_doc_Mudrex_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://docs.trade.mudrex.com/docs

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: 'spot' or 'futures'
- `toAccount`::string: 'spot' or 'futures'
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)
"""
__ccxt_doc_Mudrex_transfer
