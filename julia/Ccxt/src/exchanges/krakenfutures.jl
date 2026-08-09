@kwdef mutable struct Krakenfutures <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    fetchOrderBook::Function = fetchOrderBook
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    fetchOrder::Function = fetchOrder
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    parseOrderType::Function = parseOrderType
    verifyOrderActionSuccess::Function = verifyOrderActionSuccess
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchMyTrades::Function = fetchMyTrades
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchPositions::Function = fetchPositions
    parsePositions::Function = parsePositions
    parsePosition::Function = parsePosition
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    parseTransfer::Function = parseTransfer
    parseAccount::Function = parseAccount
    transferOut::Function = transferOut
    transfer::Function = transfer
    setLeverage::Function = setLeverage
    fetchLeverages::Function = fetchLeverages
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    handleErrors::Function = handleErrors
    sign::Function = sign

# Generated REST endpoint fields
    publicGetFeeschedules::Function = publicGetFeeschedules
    publicGetInstruments::Function = publicGetInstruments
    publicGetOrderbook::Function = publicGetOrderbook
    publicGetTickers::Function = publicGetTickers
    publicGetHistory::Function = publicGetHistory
    publicGetHistoricalfundingrates::Function = publicGetHistoricalfundingrates
    privateGetFeeschedulesVolumes::Function = privateGetFeeschedulesVolumes
    privateGetOpenpositions::Function = privateGetOpenpositions
    privateGetNotifications::Function = privateGetNotifications
    privateGetAccounts::Function = privateGetAccounts
    privateGetOpenorders::Function = privateGetOpenorders
    privateGetRecentorders::Function = privateGetRecentorders
    privateGetFills::Function = privateGetFills
    privateGetTransfers::Function = privateGetTransfers
    privateGetLeveragepreferences::Function = privateGetLeveragepreferences
    privateGetPnlpreferences::Function = privateGetPnlpreferences
    privateGetAssignmentprogramCurrent::Function = privateGetAssignmentprogramCurrent
    privateGetAssignmentprogramHistory::Function = privateGetAssignmentprogramHistory
    privateGetOrdersStatus::Function = privateGetOrdersStatus
    privatePostSendorder::Function = privatePostSendorder
    privatePostEditorder::Function = privatePostEditorder
    privatePostCancelorder::Function = privatePostCancelorder
    privatePostTransfer::Function = privatePostTransfer
    privatePostBatchorder::Function = privatePostBatchorder
    privatePostCancelallorders::Function = privatePostCancelallorders
    privatePostCancelallordersafter::Function = privatePostCancelallordersafter
    privatePostWithdrawal::Function = privatePostWithdrawal
    privatePostAssignmentprogramAdd::Function = privatePostAssignmentprogramAdd
    privatePostAssignmentprogramDelete::Function = privatePostAssignmentprogramDelete
    privatePutLeveragepreferences::Function = privatePutLeveragepreferences
    privatePutPnlpreferences::Function = privatePutPnlpreferences
    chartsGetPriceTypeSymbolInterval::Function = chartsGetPriceTypeSymbolInterval
    historyGetOrders::Function = historyGetOrders
    historyGetExecutions::Function = historyGetExecutions
    historyGetTriggers::Function = historyGetTriggers
    historyGetAccountlogcsv::Function = historyGetAccountlogcsv
    historyGetAccountLog::Function = historyGetAccountLog
    historyGetMarketSymbolOrders::Function = historyGetMarketSymbolOrders
    historyGetMarketSymbolExecutions::Function = historyGetMarketSymbolExecutions

end
function describe(self::Krakenfutures, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "krakenfutures",
    Symbol("name") => "Kraken Futures",
    Symbol("countries") => ["US"],
    Symbol("version") => "v3",
    Symbol("userAgent") => nothing,
    Symbol("rateLimit") => 600,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => false,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchFundingHistory") => nothing,
        Symbol("fetchFundingRate") => "emulated",
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => true,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => false,
        Symbol("transfer") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://demo-futures.kraken.com/derivatives/api/",
            Symbol("private") => "https://demo-futures.kraken.com/derivatives/api/",
            Symbol("charts") => "https://demo-futures.kraken.com/api/charts/",
            Symbol("history") => "https://demo-futures.kraken.com/api/history/",
            Symbol("www") => "https://demo-futures.kraken.com"
        ),
        Symbol("logo") => "https://user-images.githubusercontent.com/24300605/81436764-b22fd580-9172-11ea-9703-742783e6376d.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("charts") => "https://futures.kraken.com/api/charts/",
            Symbol("history") => "https://futures.kraken.com/api/history/",
            Symbol("feeschedules") => "https://futures.kraken.com/api/feeschedules/",
            Symbol("public") => "https://futures.kraken.com/derivatives/api/",
            Symbol("private") => "https://futures.kraken.com/derivatives/api/"
        ),
        Symbol("www") => "https://futures.kraken.com/",
        Symbol("doc") => ["https://docs.kraken.com/api/docs/futures-api/trading/market-data/"],
        Symbol("fees") => "https://support.kraken.com/hc/en-us/articles/360022835771-Transaction-fees-and-rebates-for-Kraken-Futures",
        Symbol("referral") => nothing
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => ["feeschedules", "instruments", "orderbook", "tickers", "history", "historicalfundingrates"]
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => ["feeschedules/volumes", "openpositions", "notifications", "accounts", "openorders", "recentorders", "fills", "transfers", "leveragepreferences", "pnlpreferences", "assignmentprogram/current", "assignmentprogram/history", "orders/status"],
            Symbol("post") => ["sendorder", "editorder", "cancelorder", "transfer", "batchorder", "cancelallorders", "cancelallordersafter", "withdrawal", "assignmentprogram/add", "assignmentprogram/delete"],
            Symbol("put") => ["leveragepreferences", "pnlpreferences"]
        ),
        Symbol("charts") => Dict{Symbol, Any}(
            Symbol("get") => ["{price_type}/{symbol}/{interval}"]
        ),
        Symbol("history") => Dict{Symbol, Any}(
            Symbol("get") => ["orders", "executions", "triggers", "accountlogcsv", "account-log", "market/{symbol}/orders", "market/{symbol}/executions"]
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0005"),
            Symbol("maker") => self.parseNumber("0.0002"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0005")], [self.parseNumber("100000"), self.parseNumber("0.0004")], [self.parseNumber("1000000"), self.parseNumber("0.0003")], [self.parseNumber("5000000"), self.parseNumber("0.00025")], [self.parseNumber("10000000"), self.parseNumber("0.0002")], [self.parseNumber("20000000"), self.parseNumber("0.00015")], [self.parseNumber("50000000"), self.parseNumber("0.000125")], [self.parseNumber("100000000"), self.parseNumber("0.0001")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0002")], [self.parseNumber("100000"), self.parseNumber("0.0015")], [self.parseNumber("1000000"), self.parseNumber("0.000125")], [self.parseNumber("5000000"), self.parseNumber("0.0001")], [self.parseNumber("10000000"), self.parseNumber("0.000075")], [self.parseNumber("20000000"), self.parseNumber("0.00005")], [self.parseNumber("50000000"), self.parseNumber("0.000025")], [self.parseNumber("100000000"), self.parseNumber("0")]]
            )
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("apiLimitExceeded") => RateLimitExceeded,
            Symbol("marketUnavailable") => ContractUnavailable,
            Symbol("requiredArgumentMissing") => BadRequest,
            Symbol("unavailable") => ExchangeNotAvailable,
            Symbol("authenticationError") => AuthenticationError,
            Symbol("accountInactive") => ExchangeError,
            Symbol("invalidAccount") => BadRequest,
            Symbol("invalidAmount") => BadRequest,
            Symbol("insufficientFunds") => InsufficientFunds,
            Symbol("Bad Request") => BadRequest,
            Symbol("Unavailable") => ExchangeNotAvailable,
            Symbol("invalidUnit") => BadRequest,
            Symbol("Json Parse Error") => ExchangeError,
            Symbol("nonceBelowThreshold") => InvalidNonce,
            Symbol("nonceDuplicate") => InvalidNonce,
            Symbol("notFound") => BadRequest,
            Symbol("Server Error") => ExchangeError,
            Symbol("unknownError") => ExchangeError
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("invalidArgument") => BadRequest,
            Symbol("nonceBelowThreshold") => InvalidNonce,
            Symbol("nonceDuplicate") => InvalidNonce
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("access") => Dict{Symbol, Any}(
            Symbol("history") => Dict{Symbol, Any}(
                Symbol("GET") => Dict{Symbol, Any}(
                    Symbol("orders") => "private",
                    Symbol("executions") => "private",
                    Symbol("triggers") => "private",
                    Symbol("accountlogcsv") => "private",
                    Symbol("account-log") => "private"
                )
            )
        ),
        Symbol("settlementCurrencies") => Dict{Symbol, Any}(
            Symbol("flex") => ["USDT", "BTC", "USD", "GBP", "EUR", "USDC"]
        ),
        Symbol("symbol") => Dict{Symbol, Any}(
            Symbol("quoteIds") => ["USD", "XBT"],
            Symbol("reversed") => false
        ),
        Symbol("versions") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("GET") => Dict{Symbol, Any}(
                    Symbol("historicalfundingrates") => "v4"
                )
            ),
            Symbol("charts") => Dict{Symbol, Any}(
                Symbol("GET") => Dict{Symbol, Any}(
                    Symbol("{price_type}/{symbol}/{interval}") => "v1"
                )
            ),
            Symbol("history") => Dict{Symbol, Any}(
                Symbol("GET") => Dict{Symbol, Any}(
                    Symbol("orders") => "v2",
                    Symbol("executions") => "v2",
                    Symbol("triggers") => "v2",
                    Symbol("accountlogcsv") => "v2"
                )
            )
        ),
        Symbol("fetchTrades") => Dict{Symbol, Any}(
            Symbol("method") => "historyGetMarketSymbolExecutions"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true
                ),
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
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
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 100
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => nothing,
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
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 2000
            )
        ),
        Symbol("spot") => nothing,
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("4h") => "4h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w"
    )
))

end
function fetchMarkets(self::Krakenfutures, params=Dict())
    response = Base.fetch(self.publicGetInstruments(params));
    instruments = safeValue(response, "instruments", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(instruments)))
        market = get(instruments, i + 1, nothing);
        id = safeString(market, "symbol");
        marketType = safeString(market, "type");
        type_var = nothing;
        index = (findfirst(" index", marketType) !== nothing);
        linear = nothing;
        inverse = nothing;
        expiry = nothing;
        if functions.ccxtruthy(!functions.ccxtruthy(index))
            linear = (findfirst("_vanilla", marketType) !== nothing);
            inverse = !functions.ccxtruthy(linear);
            settleTime = safeString(market, "lastTradingTime");
            type_var = functions.ccxtruthy((settleTime == nothing)) ? "swap" : "future";
            expiry = self.parse8601(settleTime);
        else
            type_var = "index";
        end
        swap = (type_var == "swap");
        future = (type_var == "future");
        symbol = id;
        split_var = split(id, "_");
        splitMarket = safeString(split_var, 1);
        baseId = splitMarket[0 + 1:length(splitMarket) - 3];
        quoteId = "usd";
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = nothing;
        settleId = nothing;
        cvtp = safeString(market, "contractValueTradePrecision");
        amountPrecision = self.parseNumber(self.integerPrecisionToAmount(cvtp));
        pricePrecision = self.safeNumber(market, "tickSize");
        contract = (@functions.ccxt_or(@functions.ccxt_or(swap, future), index));
        swapOrFutures = (@functions.ccxt_or(swap, future));
        if functions.ccxtruthy(swapOrFutures)
            exchangeType = safeString(market, "type");
            if functions.ccxtruthy(exchangeType == "futures_inverse")
                settle = base;
                settleId = baseId;
                inverse = true;
            else
                settle = quote_var;
                settleId = quoteId;
                inverse = false;
            end
            linear = !functions.ccxtruthy(inverse);
            symbol = string(base, "/", quote_var, ":", settle);
            if functions.ccxtruthy(future)
                symbol = string(symbol, "-", self.yymmdd(expiry));
            end
        end
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("index") => index,
    Symbol("active") => self.safeBool(market, "tradeable"),
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("maintenanceMarginRate") => nothing,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => pricePrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
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
        )
    ),
    Symbol("created") => self.parse8601(safeString(market, "openingDate")),
    Symbol("info") => market
));
        i += 1
    end
    settlementCurrencies = get(get(self.options, Symbol("settlementCurrencies"), nothing), Symbol("flex"), nothing);
    currencies = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlementCurrencies)))
        code = get(settlementCurrencies, i + 1, nothing);
        push!(currencies, Dict{Symbol, Any}(
    Symbol("id") => lowercase(code),
    Symbol("numericId") => nothing,
    Symbol("code") => code,
    Symbol("precision") => nothing
));
        i += 1
    end
    self.currencies = self.mapToSafeMap(deepExtend(currencies, self.currencies));
    return result

end
function fetchOrderBook(self::Krakenfutures, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetOrderbook(extend(request, params)));
    timestamp = self.parse8601(get(response, Symbol("serverTime"), nothing));
    return self.parseOrderBook(get(response, Symbol("orderBook"), nothing), symbol, timestamp)

end
function fetchTickers(self::Krakenfutures, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTickers(params));
    tickers = self.safeList(response, "tickers");
    return self.parseTickers(tickers, symbols)

end
function parseTicker(self::Krakenfutures, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = self.parse8601(safeString(ticker, "lastTime"));
    open = safeString(ticker, "open24h");
    last_var = safeString(ticker, "last");
    change = stringSub(last_var, open);
    percentage = stringMul(stringDiv(change, open), "100");
    average = stringDiv(stringAdd(open, last_var), "2");
    volume = safeString(ticker, "vol24h");
    baseVolume = nothing;
    quoteVolume = nothing;
    isIndex = self.safeBool(market, "index", false);
    if functions.ccxtruthy(!functions.ccxtruthy(isIndex))
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            baseVolume = volume;
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            quoteVolume = volume;
        end
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => safeString(ticker, "bidSize"),
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => safeString(ticker, "askSize"),
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => change,
    Symbol("percentage") => percentage,
    Symbol("average") => average,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString(ticker, "markPrice"),
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("info") => ticker
))

end
function fetchOHLCV(self::Krakenfutures, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 2000))
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("price_type") => safeString(params, "price", "trade"),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    params = omit(params, "price");
    if functions.ccxtruthy(since != nothing)
        duration = self.parseTimeframe(timeframe);
        request[Symbol("from")] = self.parseToInt(since / 1000);
        if functions.ccxtruthy(limit == nothing)
            limit = 2000;
        end
        limit = min(limit, 2000);
        toTimestamp = self.sum(get(request, Symbol("from"), nothing), limit * duration - 1);
        currentTimestamp = seconds();
        request[Symbol("to")] = min(toTimestamp, currentTimestamp);
    elseif functions.ccxtruthy(limit != nothing)
        limit = min(limit, 2000);
        duration = self.parseTimeframe(timeframe);
        request[Symbol("to")] = seconds();
        request[Symbol("from")] = self.parseToInt(get(request, Symbol("to"), nothing) - (duration * limit));
    end
    response = Base.fetch(self.chartsGetPriceTypeSymbolInterval(extend(request, params)));
    candles = self.safeList(response, "candles");
    return self.parseOHLCVs(candles, market, timeframe, since, limit)

end
function parseOHLCV(self::Krakenfutures, ohlcv, market=nothing)
    return [safeInteger(ohlcv, "time"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function fetchTrades(self::Krakenfutures, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTrades", symbol, since, limit, params))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchTrades", "method", "historyGetMarketSymbolExecutions");
    rawTrades = [];
    isFullHistoryEndpoint = (method == "historyGetMarketSymbolExecutions");
    if functions.ccxtruthy(isFullHistoryEndpoint)
        (request, params) = self.handleUntilOption("before", request, params);
        if functions.ccxtruthy(since != nothing)
            request[Symbol("since")] = since;
            request[Symbol("sort")] = "asc";
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("count")] = limit;
        end
        response = Base.fetch(self.historyGetMarketSymbolExecutions(extend(request, params)));
        elements = self.safeList(response, "elements", []);
        rawTrades = [];
        len = length(elements);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, len))
            index = len - 1 - i;
            element = get(elements, index + 1, nothing);
            event = self.safeDict(element, "event", Dict{Symbol, Any}());
            executionContainer = self.safeDict(event, "Execution", Dict{Symbol, Any}());
            rawTrade = self.safeDict(executionContainer, "execution", Dict{Symbol, Any}());
            push!(rawTrades, rawTrade);
            i += 1
        end

    else
        (request, params) = self.handleUntilOption("lastTime", request, params);
        response = Base.fetch(self.publicGetHistory(extend(request, params)));
        rawTrades = self.safeList(response, "history", []);
    end
    return self.parseTrades(rawTrades, market, since, limit)

end
function parseTrade(self::Krakenfutures, trade, market=nothing)
    timestamp = self.parse8601(safeString2(trade, "time", "fillTime"));
    price = safeString(trade, "price");
    amount = safeStringN(trade, ["size", "amount", "quantity"], "0.0");
    id = safeString2(trade, "uid", "fill_id");
    if functions.ccxtruthy(id == nothing)
        id = safeString(trade, "executionId");
    end
    order = safeString(trade, "order_id");
    marketId = safeString(trade, "symbol");
    side = safeString(trade, "side");
    type_var = nothing;
    priorEdit = safeValue(trade, "orderPriorEdit");
    priorExecution = safeValue(trade, "orderPriorExecution");
    if functions.ccxtruthy(priorExecution != nothing)
        order = safeString(priorExecution, "orderId");
        marketId = safeString(priorExecution, "symbol");
        side = safeString(priorExecution, "side");
        type_var = safeString(priorExecution, "type");
    elseif functions.ccxtruthy(priorEdit != nothing)
        order = safeString(priorEdit, "orderId");
        marketId = safeString(priorEdit, "symbol");
        side = safeString(priorEdit, "type");
        type_var = safeString(priorEdit, "type");
    end
    if functions.ccxtruthy(type_var != nothing)
        type_var = self.parseOrderType(type_var);
    end
    market = self.safeMarket(marketId, market);
    cost = nothing;
    linear = self.safeBool(market, "linear");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((amount != nothing), (price != nothing)), (market != nothing)))
        if functions.ccxtruthy(linear)
            cost = stringMul(amount, price);
        else
            cost = stringDiv(amount, price);
        end
        contractSize = safeString(market, "contractSize");
        cost = stringMul(cost, contractSize);
    end
    takerOrMaker = nothing;
    fillType = safeString(trade, "fillType");
    if functions.ccxtruthy(fillType != nothing)
        if functions.ccxtruthy(findfirst("taker", fillType) !== nothing)
            takerOrMaker = "taker";
        elseif functions.ccxtruthy(findfirst("maker", fillType) !== nothing)
            takerOrMaker = "maker";
        end
    end
    isHistoricalExecution = (ccxt_in("takerOrder", trade));
    if functions.ccxtruthy(isHistoricalExecution)
        timestamp = safeInteger(trade, "timestamp");
        taker = self.safeDict(trade, "takerOrder", Dict{Symbol, Any}());
        if functions.ccxtruthy(taker != nothing)
            side = safeStringLower(taker, "direction");
            takerOrMaker = "taker";
        end
    end
    fee = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((takerOrMaker != nothing), (cost != nothing)))
        feeRate = safeString(market, takerOrMaker);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => stringMul(cost, feeRate),
            Symbol("currency") => safeString(market, "quote"),
            Symbol("rate") => feeRate
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("order") => order,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => functions.ccxtruthy(linear) ? amount : nothing,
    Symbol("cost") => cost,
    Symbol("fee") => fee
))

end
function createOrderRequest(self::Krakenfutures, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    symbol = get(market, Symbol("symbol"), nothing);
    type_var = safeString(params, "orderType", type_var);
    timeInForce = safeString(params, "timeInForce");
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(type_var == "market", type_var == "post", params);
    if functions.ccxtruthy(postOnly)
        type_var = "post";
    elseif functions.ccxtruthy(timeInForce == "ioc")
        type_var = "ioc";
    else
        if functions.ccxtruthy(type_var == "limit")
            type_var = "lmt";
        elseif functions.ccxtruthy(type_var == "market")
            type_var = "mkt";
        end

    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("size") => self.amountToPrecision(symbol, amount)
    );
    clientOrderId = safeString2(params, "clientOrderId", "cliOrdId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("cliOrdId")] = clientOrderId;
    end
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    isTriggerOrder = triggerPrice != nothing;
    stopLossTriggerPrice = safeString(params, "stopLossPrice");
    takeProfitTriggerPrice = safeString(params, "takeProfitPrice");
    isStopLossTriggerOrder = stopLossTriggerPrice != nothing;
    isTakeProfitTriggerOrder = takeProfitTriggerPrice != nothing;
    isStopLossOrTakeProfitTrigger = @functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder);
    triggerSignal = safeString(params, "triggerSignal", "last");
    reduceOnly = safeValue(params, "reduceOnly");
    if functions.ccxtruthy(@functions.ccxt_or(isStopLossOrTakeProfitTrigger, isTriggerOrder))
        request[Symbol("triggerSignal")] = triggerSignal;
    end
    if functions.ccxtruthy(isTriggerOrder)
        type_var = "stp";
        request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
    elseif functions.ccxtruthy(isStopLossOrTakeProfitTrigger)
        reduceOnly = true;
        if functions.ccxtruthy(isStopLossTriggerOrder)
            type_var = "stp";
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
        elseif functions.ccxtruthy(isTakeProfitTriggerOrder)
            type_var = "take_profit";
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
        end
    end
    if functions.ccxtruthy(reduceOnly)
        request[Symbol("reduceOnly")] = true;
    end
    request[Symbol("orderType")] = type_var;
    if functions.ccxtruthy(price != nothing)
        request[Symbol("limitPrice")] = self.priceToPrecision(symbol, price);
    end
    params = omit(params, ["clientOrderId", "timeInForce", "triggerPrice", "stopLossPrice", "takeProfitPrice"]);
    return extend(request, params)

end
function createOrder(self::Krakenfutures, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    response = Base.fetch(self.privatePostSendorder(orderRequest));
    sendStatus = safeValue(response, "sendStatus");
    status = safeString(sendStatus, "status");
    self.verifyOrderActionSuccess(status, "createOrder", ["filled"]);
    return self.parseOrder(sendStatus, market)

end
function createOrders(self::Krakenfutures, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = safeValue(rawOrder, "params", Dict{Symbol, Any}());
        extendedParams = extend(orderParams, params);
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("order_tag", extendedParams))))
            extendedParams[Symbol("order_tag")] =             string(self.sum(i, 1));
        end
        extendedParams[Symbol("order")] = "send";
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price, extendedParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("batchOrder") => ordersRequests
    );
    response = Base.fetch(self.privatePostBatchorder(extend(request, params)));
    data = self.safeList(response, "batchStatus", []);
    return self.parseOrders(data)

end
function editOrder(self::Krakenfutures, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("size")] = amount;
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("limitPrice")] = price;
    end
    response = Base.fetch(self.privatePostEditorder(extend(request, params)));
    status = safeString(get(response, Symbol("editStatus"), nothing), "status");
    self.verifyOrderActionSuccess(status, "editOrder", ["filled"]);
    order = self.parseOrder(get(response, Symbol("editStatus"), nothing));
    order[Symbol("info")] = response;
    return order

end
function cancelOrder(self::Krakenfutures, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostCancelorder(extend(Dict{Symbol, Any}(
        Symbol("order_id") => id
    ), params)));
    status = safeString(safeValue(response, "cancelStatus", Dict{Symbol, Any}()), "status");
    self.verifyOrderActionSuccess(status, "cancelOrder");
    order = Dict{Symbol, Any}();
    if functions.ccxtruthy(ccxt_in("cancelStatus", response))
        order = self.parseOrder(get(response, Symbol("cancelStatus"), nothing));
    end
    return extend(Dict{Symbol, Any}(
    Symbol("info") => response
), order)

end
function cancelOrders(self::Krakenfutures, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = [];
    clientOrderIds = safeValue(params, "clientOrderIds", []);
    clientOrderIdsLength = length(clientOrderIds);
    if functions.ccxtruthy(functions.ccxt_gt(clientOrderIdsLength, 0))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(clientOrderIds)))
            push!(orders, Dict{Symbol, Any}(
    Symbol("order") => "cancel",
    Symbol("cliOrdId") => get(clientOrderIds, i + 1, nothing)
));
            i += 1
        end

    else
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
            push!(orders, Dict{Symbol, Any}(
    Symbol("order") => "cancel",
    Symbol("order_id") => get(ids, i + 1, nothing)
));
            i += 1
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("batchOrder") => orders
    );
    response = Base.fetch(self.privatePostBatchorder(extend(request, params)));
    batchStatus = self.safeList(response, "batchStatus", []);
    return self.parseOrders(batchStatus)

end
function cancelAllOrders(self::Krakenfutures, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = self.marketId(symbol);
    end
    response = Base.fetch(self.privatePostCancelallorders(extend(request, params)));
    cancelStatus = self.safeDict(response, "cancelStatus");
    orderEvents = self.safeList(cancelStatus, "orderEvents", []);
    orders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderEvents)))
        orderEvent = self.safeDict(orderEvents, 0);
        order = self.safeDict(orderEvent, "order", Dict{Symbol, Any}());
        push!(orders, order);
        i += 1
    end
    return self.parseOrders(orders)

end
function cancelAllOrdersAfter(self::Krakenfutures, timeout, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("timeout") => functions.ccxtruthy((functions.ccxt_gt(timeout, 0))) ? (self.parseToInt(timeout / 1000)) : 0
    );
    response = Base.fetch(self.privatePostCancelallordersafter(extend(request, params)));
    return response

end
function fetchOpenOrders(self::Krakenfutures, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privateGetOpenorders(params));
    orders = self.safeList(response, "openOrders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOrders(self::Krakenfutures, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privateGetOrdersStatus(params));
    orders = self.safeList(response, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOrder(self::Krakenfutures, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderIds") => [id]
    );
    orders = Base.fetch(self.fetchOrders(nothing, nothing, nothing, extend(request, params)));
    order = self.safeDict(orders, 0);
    if functions.ccxtruthy(order == nothing)
        throw(OrderNotFound(string(self.id, " fetchOrder could not find order id ", id)));
    end
    return order

end
function fetchClosedOrders(self::Krakenfutures, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since")] = since;
    end
    isTrigger = self.safeBool2(params, "trigger", "stop", false);
    if functions.ccxtruthy(isTrigger)
        params = omit(params, ["trigger", "stop"]);
        response = Base.fetch(self.historyGetTriggers(extend(request, params)));
    else
        response = Base.fetch(self.historyGetOrders(extend(request, params)));
    end
    allOrders = self.safeList(response, "elements", []);
    closedOrders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(allOrders)))
        order = get(allOrders, i + 1, nothing);
        event = self.safeDict(order, "event", Dict{Symbol, Any}());
        orderPlaced = self.safeDict2(event, "OrderPlaced", "OrderTriggerActivated");
        orderUpdated = self.safeDict(event, "OrderUpdated");
        if functions.ccxtruthy(orderPlaced != nothing)
            innerOrder = self.safeDict(orderPlaced, "order", Dict{Symbol, Any}());
            filled = safeString(innerOrder, "filled");
            if functions.ccxtruthy(filled != "0")
                innerOrder[Symbol("status")] = "closed";
                                push!(closedOrders, innerOrder);
            end
        elseif functions.ccxtruthy(orderUpdated != nothing)
            reason = safeString(orderUpdated, "reason");
            if functions.ccxtruthy(reason == "full_fill")
                newOrder = self.safeDict(orderUpdated, "newOrder", Dict{Symbol, Any}());
                newOrder[Symbol("status")] = "closed";
                                push!(closedOrders, newOrder);
            end
        end
        i += 1
    end
    return self.parseOrders(closedOrders, market, since, limit)

end
function fetchCanceledOrders(self::Krakenfutures, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("count")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
    end
    isTrigger = self.safeBool2(params, "trigger", "stop", false);
    if functions.ccxtruthy(isTrigger)
        params = omit(params, ["trigger", "stop"]);
        response = Base.fetch(self.historyGetTriggers(extend(request, params)));
    else
        response = Base.fetch(self.historyGetOrders(extend(request, params)));
    end
    allOrders = self.safeList(response, "elements", []);
    canceledAndRejected = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(allOrders)))
        order = get(allOrders, i + 1, nothing);
        event = self.safeDict(order, "event", Dict{Symbol, Any}());
        isCancelledTriggerOrder = (ccxt_in("OrderTriggerCancelled", event));
        orderPlaced = self.safeDict2(event, "OrderPlaced", "OrderTriggerCancelled");
        if functions.ccxtruthy(orderPlaced != nothing)
            innerOrder = self.safeDict(orderPlaced, "order", Dict{Symbol, Any}());
            filled = safeString(innerOrder, "filled");
            if functions.ccxtruthy(@functions.ccxt_or(filled == "0", isCancelledTriggerOrder))
                innerOrder[Symbol("status")] = "canceled";
                                push!(canceledAndRejected, innerOrder);
            end
        end
        orderCanceled = self.safeDict(event, "OrderCancelled");
        if functions.ccxtruthy(orderCanceled != nothing)
            innerOrder = self.safeDict(orderCanceled, "order", Dict{Symbol, Any}());
            innerOrder[Symbol("status")] = "canceled";
                        push!(canceledAndRejected, innerOrder);
        end
        orderRejected = self.safeDict(event, "OrderRejected");
        if functions.ccxtruthy(orderRejected != nothing)
            innerOrder = self.safeDict(orderRejected, "order", Dict{Symbol, Any}());
            innerOrder[Symbol("status")] = "rejected";
                        push!(canceledAndRejected, innerOrder);
        end
        i += 1
    end
    return self.parseOrders(canceledAndRejected, market, since, limit)

end
function parseOrderType(self::Krakenfutures, orderType)
    typesMap = Dict{Symbol, Any}(
        Symbol("lmt") => "limit",
        Symbol("mkt") => "market",
        Symbol("post") => "limit",
        Symbol("ioc") => "market"
    );
    return safeString(typesMap, orderType, orderType)

end
function verifyOrderActionSuccess(self::Krakenfutures, status, method, omit=[])
    errors = Dict{Symbol, Any}(
        Symbol("invalidOrderType") => InvalidOrder,
        Symbol("invalidSide") => InvalidOrder,
        Symbol("invalidSize") => InvalidOrder,
        Symbol("invalidPrice") => InvalidOrder,
        Symbol("insufficientAvailableFunds") => InsufficientFunds,
        Symbol("selfFill") => ExchangeError,
        Symbol("tooManySmallOrders") => ExchangeError,
        Symbol("maxPositionViolation") => BadRequest,
        Symbol("marketSuspended") => ExchangeNotAvailable,
        Symbol("marketInactive") => ExchangeNotAvailable,
        Symbol("clientOrderIdAlreadyExist") => DuplicateOrderId,
        Symbol("clientOrderIdTooLong") => BadRequest,
        Symbol("outsidePriceCollar") => InvalidOrder,
        Symbol("postWouldExecute") => OrderImmediatelyFillable,
        Symbol("iocWouldNotExecute") => OrderNotFillable,
        Symbol("wouldNotReducePosition") => ExchangeError,
        Symbol("orderForEditNotFound") => OrderNotFound,
        Symbol("orderForEditNotAStop") => InvalidOrder,
        Symbol("filled") => OrderNotFound,
        Symbol("notFound") => OrderNotFound
    );
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in(status, errors)), !functions.ccxtruthy(inArray(status, omit))))
        throw(get(errors, Symbol(status), nothing)(string(self.id, ": ", method, " failed due to ", status)));
    end

end
function parseOrderStatus(self::Krakenfutures, status)
    statuses = Dict{Symbol, Any}(
        Symbol("placed") => "open",
        Symbol("cancelled") => "canceled",
        Symbol("invalidOrderType") => "rejected",
        Symbol("invalidSide") => "rejected",
        Symbol("invalidSize") => "rejected",
        Symbol("invalidPrice") => "rejected",
        Symbol("insufficientAvailableFunds") => "rejected",
        Symbol("selfFill") => "rejected",
        Symbol("tooManySmallOrders") => "rejected",
        Symbol("maxPositionViolation") => "rejected",
        Symbol("marketSuspended") => "rejected",
        Symbol("marketInactive") => "rejected",
        Symbol("clientOrderIdAlreadyExist") => "rejected",
        Symbol("clientOrderIdTooLong") => "rejected",
        Symbol("outsidePriceCollar") => "rejected",
        Symbol("postWouldExecute") => "rejected",
        Symbol("iocWouldNotExecute") => "rejected",
        Symbol("wouldNotReducePosition") => "rejected",
        Symbol("edited") => "open",
        Symbol("orderForEditNotFound") => "rejected",
        Symbol("orderForEditNotAStop") => "rejected",
        Symbol("filled") => "closed",
        Symbol("notFound") => "rejected",
        Symbol("untouched") => "open",
        Symbol("partiallyFilled") => "open",
        Symbol("ENTERED_BOOK") => "open",
        Symbol("FULLY_EXECUTED") => "closed",
        Symbol("CANCELLED") => "canceled",
        Symbol("TRIGGER_PLACED") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("UNTOUCHED") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Krakenfutures, order, market=nothing)
    orderDictFromFetchOrder = self.safeDict(order, "order");
    if functions.ccxtruthy(orderDictFromFetchOrder != nothing)
        datetime = safeString(orderDictFromFetchOrder, "timestamp");
        innerStatus = safeString(order, "status");
        fetchOrderPriceTriggerOptions = self.safeDict(orderDictFromFetchOrder, "priceTriggerOptions", Dict{Symbol, Any}());
        fetchOrderTriggerPrice = safeString(fetchOrderPriceTriggerOptions, "triggerPrice");
        unifiedSymbol = self.safeSymbol(safeString(orderDictFromFetchOrder, "symbol"), market);
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(orderDictFromFetchOrder, "orderId"),
    Symbol("clientOrderId") => safeStringN(orderDictFromFetchOrder, ["cliOrdId"]),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => self.parse8601(safeString(orderDictFromFetchOrder, "lastUpdateTimestamp")),
    Symbol("symbol") => unifiedSymbol,
    Symbol("type") => nothing,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("reduceOnly") => self.safeBool(orderDictFromFetchOrder, "reduceOnly"),
    Symbol("side") => safeString(orderDictFromFetchOrder, "side"),
    Symbol("price") => nothing,
    Symbol("triggerPrice") => fetchOrderTriggerPrice,
    Symbol("stopPrice") => fetchOrderTriggerPrice,
    Symbol("amount") => safeString(orderDictFromFetchOrder, "quantity"),
    Symbol("cost") => nothing,
    Symbol("average") => nothing,
    Symbol("filled") => safeString(orderDictFromFetchOrder, "filled"),
    Symbol("remaining") => nothing,
    Symbol("status") => self.parseOrderStatus(innerStatus),
    Symbol("fee") => nothing,
    Symbol("fees") => nothing,
    Symbol("trades") => nothing
))
    end
    orderEvents = safeValue(order, "orderEvents", []);
    errorStatus = safeString(order, "status");
    orderEventsLength = length(orderEvents);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((ccxt_in("orderEvents", order)), (errorStatus != nothing)), (orderEventsLength == 0)))
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("status") => "rejected"
))
    end
    details = nothing;
    isPrior = false;
    fixed = false;
    statusId = nothing;
    price = nothing;
    trades = [];
    if functions.ccxtruthy(orderEventsLength)
        executions = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(orderEvents)))
            item = get(orderEvents, i + 1, nothing);
            if functions.ccxtruthy(safeString(item, "type") == "EXECUTION")
                                push!(executions, item);
            end
            orderTrigger = safeValue(item, "orderTrigger");
            if functions.ccxtruthy(details == nothing)
                details = safeValue2(item, "new", "order", orderTrigger);
                if functions.ccxtruthy(details != nothing)
                    isPrior = false;
                    fixed = true;
                elseif functions.ccxtruthy(!functions.ccxtruthy(fixed))
                    executedPrice = safeString(item, "price");
                    orderPriorExecution = safeValue(item, "orderPriorExecution");
                    details = safeValue2(item, "orderPriorExecution", "orderPriorEdit");
                    if functions.ccxtruthy(executedPrice == nothing)
                        price = safeString(orderPriorExecution, "limitPrice");
                    else
                        price = executedPrice;
                    end
                    if functions.ccxtruthy(details != nothing)
                        isPrior = true;
                    end
                end
            end
            i += 1
        end

        trades = self.parseTrades(executions);
        statusId = safeString(order, "status");
    end
    if functions.ccxtruthy(details == nothing)
        details = order;
    end
    if functions.ccxtruthy(statusId == nothing)
        statusId = safeString(details, "status");
    end
    status = self.parseOrderStatus(statusId);
    isClosed = inArray(status, ["canceled", "rejected", "closed"]);
    marketId = safeString2(details, "symbol", "tradeable");
    market = self.safeMarket(marketId, market);
    symbol = safeString(market, "symbol");
    timestamp = self.parse8601(safeString2(details, "timestamp", "receivedTime"));
    lastUpdateTimestamp = self.parse8601(safeString(details, "lastUpdateTime"));
    amount = safeString(details, "quantity");
    filled = safeString2(details, "filledSize", "filled", "0.0");
    remaining = safeString(details, "unfilledSize");
    average = nothing;
    filled2 = "0.0";
    tradesLength = length(trades);
    if functions.ccxtruthy(functions.ccxt_gt(tradesLength, 0))
        vwapSum = "0.0";
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(trades)))
            trade = get(trades, i + 1, nothing);
            tradeAmount = safeString(trade, "amount");
            tradePrice = safeString(trade, "price");
            filled2 = stringAdd(filled2, tradeAmount);
            vwapSum = stringAdd(vwapSum, stringMul(tradeAmount, tradePrice));
            i += 1
        end

        average = stringDiv(vwapSum, filled2);
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((amount != nothing), (!functions.ccxtruthy(isClosed))), isPrior), stringGe(filled2, amount)))
            status = "closed";
            isClosed = true;
        end
        if functions.ccxtruthy(isPrior)
            filled = stringAdd(filled, filled2);
        else
            filled = stringMax(filled, filled2);
        end
    end
    if functions.ccxtruthy(remaining == nothing)
        if functions.ccxtruthy(isPrior)
            if functions.ccxtruthy(amount != nothing)
                remaining = stringSub(amount, filled2);
            end
        else
            remaining = amount;
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((amount == nothing), (!functions.ccxtruthy(isPrior))), (remaining != nothing)))
        amount = stringAdd(filled, remaining);
    end
    cost = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((filled != nothing), (market != nothing)))
        whichPrice = functions.ccxtruthy((average != nothing)) ? average : price;
        if functions.ccxtruthy(whichPrice != nothing)
            if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
                cost = stringMul(filled, whichPrice);
            else
                cost = stringDiv(filled, whichPrice);
            end
        end
    end
    id = safeString2(order, "order_id", "orderId");
    if functions.ccxtruthy(id == nothing)
        id = safeString2(details, "orderId", "uid");
    end
    type_var = safeStringLower2(details, "type", "orderType");
    timeInForce = "gtc";
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "ioc", self.parseOrderType(type_var) == "market"))
        timeInForce = "ioc";
    end
    ts = safeInteger(details, "timestamp", timestamp);
    priceTriggerOptions = self.safeDict(details, "priceTriggerOptions", Dict{Symbol, Any}());
    triggerPrice = safeString2(details, "triggerPrice", "stopPrice");
    if functions.ccxtruthy(triggerPrice == nothing)
        triggerPrice = safeString(priceTriggerOptions, "triggerPrice");
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => safeStringN(details, ["clientOrderId", "clientId", "cliOrdId"]),
    Symbol("timestamp") => ts,
    Symbol("datetime") => self.iso8601(ts),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(details, "lastUpdateTimestamp", lastUpdateTimestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderType(type_var),
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => type_var == "post",
    Symbol("reduceOnly") => self.safeBool2(details, "reduceOnly", "reduce_only"),
    Symbol("side") => safeStringLower2(details, "side", "direction"),
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("stopPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => nothing,
    Symbol("fees") => nothing,
    Symbol("trades") => trades
))

end
function fetchMyTrades(self::Krakenfutures, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privateGetFills(params));
    return self.parseTrades(get(response, Symbol("fills"), nothing), market, since, limit)

end
function fetchBalance(self::Krakenfutures, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = safeString2(params, "type", "account");
    symbol = safeString(params, "symbol");
    params = omit(params, ["type", "account", "symbol"]);
    response = Base.fetch(self.privateGetAccounts(params));
    datetime = safeString(response, "serverTime");
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "marginAccount", type_var == "margin"))
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchBalance requires symbol argument for margin accounts")));
        end
        type_var = symbol;
    end
    if functions.ccxtruthy(type_var == nothing)
        type_var = functions.ccxtruthy((symbol == nothing)) ? "flex" : symbol;
    end
    accountName = self.parseAccount(type_var);
    accounts = safeValue(response, "accounts");
    account = safeValue(accounts, accountName);
    if functions.ccxtruthy(account == nothing)
        type_var = functions.ccxtruthy((type_var == nothing)) ? "" : type_var;
        symbol = functions.ccxtruthy((symbol == nothing)) ? "" : symbol;
        throw(BadRequest(string(self.id, " fetchBalance has no account for ", type_var)));
    end
    balance = self.parseBalance(account);
    balance[Symbol("info")] = response;
    balance[Symbol("timestamp")] = self.parse8601(datetime);
    balance[Symbol("datetime")] = datetime;
    return balance

end
function parseBalance(self::Krakenfutures, response)
    accountType = safeString2(response, "accountType", "type");
    isFlex = (accountType == "multiCollateralMarginAccount");
    isCash = (accountType == "cashAccount");
    balances = safeValue2(response, "balances", "currencies", Dict{Symbol, Any}());
    result = Dict{Symbol, Any}();
    currencyIds = objectKeys(balances);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        balance = get(balances, Symbol(currencyId), nothing);
        code = self.safeCurrencyCode(currencyId);
        splitCode = split(code, "_");
        codeLength = length(splitCode);
        if functions.ccxtruthy(functions.ccxt_gt(codeLength, 1))
            i += 1; continue
        end
        account = self.account();
        if functions.ccxtruthy(isFlex)
            account[Symbol("total")] = safeString(balance, "quantity");
            account[Symbol("free")] = safeString(balance, "available");
        elseif functions.ccxtruthy(isCash)
            account[Symbol("used")] = "0.0";
            account[Symbol("total")] = balance;
        else
            auxiliary = safeValue(response, "auxiliary");
            account[Symbol("free")] = safeString(auxiliary, "af");
            account[Symbol("total")] = safeString(auxiliary, "pv");
        end
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchFundingRates(self::Krakenfutures, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketIds = self.marketIds(symbols);
    response = Base.fetch(self.publicGetTickers(params));
    tickers = self.safeList(response, "tickers", []);
    fundingRates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        entry = get(tickers, i + 1, nothing);
        entry_symbol = safeValue(entry, "symbol");
        if functions.ccxtruthy(marketIds != nothing)
            if functions.ccxtruthy(!functions.ccxtruthy(inArray(entry_symbol, marketIds)))
                i += 1; continue
            end
        end
        market = self.safeMarket(entry_symbol);
        parsed = self.parseFundingRate(entry, market);
        push!(fundingRates, parsed);
        i += 1
    end
    return indexBy(fundingRates, "symbol")

end
function parseFundingRate(self::Krakenfutures, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    symbol = self.symbol(marketId);
    timestamp = self.parse8601(safeString(ticker, "lastTime"));
    markPriceString = safeString(ticker, "markPrice");
    fundingRateString = safeString(ticker, "fundingRate");
    fundingRateResult = stringDiv(fundingRateString, markPriceString);
    nextFundingRateString = safeString(ticker, "fundingRatePrediction");
    nextFundingRateResult = stringDiv(nextFundingRateString, markPriceString);
    if functions.ccxtruthy(stringGt(fundingRateResult, "0.25"))
        fundingRateResult = "0.25";
    elseif functions.ccxtruthy(stringLt(fundingRateResult, "-0.25"))
        fundingRateResult = "-0.25";
    end
    if functions.ccxtruthy(stringGt(nextFundingRateResult, "0.25"))
        nextFundingRateResult = "0.25";
    elseif functions.ccxtruthy(stringLt(nextFundingRateResult, "-0.25"))
        nextFundingRateResult = "-0.25";
    end
    return Dict{Symbol, Any}(
    Symbol("info") => ticker,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => self.parseNumber(markPriceString),
    Symbol("indexPrice") => self.safeNumber(ticker, "indexPrice"),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.parseNumber(fundingRateResult),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => self.parseNumber(nextFundingRateResult),
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => "1h"
)

end
function fetchFundingRateHistory(self::Krakenfutures, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadRequest(string(self.id, " fetchFundingRateHistory() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeStringUpper(market, "id")
    );
    response = Base.fetch(self.publicGetHistoricalfundingrates(extend(request, params)));
    rates = safeValue(response, "rates");
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rates)))
        item = get(rates, i + 1, nothing);
        datetime = safeString(item, "timestamp");
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("symbol") => symbol,
    Symbol("fundingRate") => self.safeNumber(item, "relativeFundingRate"),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime
));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function fetchPositions(self::Krakenfutures, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetOpenpositions(request));
    result = self.parsePositions(response);
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function parsePositions(self::Krakenfutures, response, symbols=nothing, params=Dict())
    result = [];
    positions = safeValue(response, "openPositions");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        position = self.parsePosition(get(positions, i + 1, nothing));
        push!(result, position);
        i += 1
    end
    return result

end
function parsePosition(self::Krakenfutures, position, market=nothing)
    leverage = self.safeNumber(position, "maxFixedLeverage");
    marginType = "cross";
    if functions.ccxtruthy(leverage != nothing)
        marginType = "isolated";
    end
    datetime = safeString(position, "fillTime");
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("entryPrice") => self.safeNumber(position, "price"),
    Symbol("notional") => nothing,
    Symbol("leverage") => leverage,
    Symbol("unrealizedPnl") => nothing,
    Symbol("contracts") => self.safeNumber(position, "size"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("collateral") => nothing,
    Symbol("marginType") => marginType,
    Symbol("side") => safeString(position, "side"),
    Symbol("percentage") => nothing
)

end
function fetchLeverageTiers(self::Krakenfutures, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetInstruments(params));
    data = self.safeList(response, "instruments");
    return self.parseLeverageTiers(data, symbols, "symbol")

end
function parseMarketLeverageTiers(self::Krakenfutures, info, market=nothing)
    marginLevels = safeValue(info, "marginLevels");
    marketId = safeString(info, "symbol");
    market = self.safeMarket(marketId, market);
    tiers = [];
    if functions.ccxtruthy(marginLevels == nothing)
            return tiers
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marginLevels)))
        tier = get(marginLevels, i + 1, nothing);
        initialMargin = safeString(tier, "initialMargin");
        minNotional = self.safeNumber2(tier, "numNonContractUnits", "contracts");
        if functions.ccxtruthy(i != 0)
            tiersLength = length(tiers);
            previousTier = get(tiers, tiersLength - 1 + 1, nothing);
            previousTier[Symbol("maxNotional")] = minNotional;
        end
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.sum(i, 1),
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("currency") => get(market, Symbol("quote"), nothing),
    Symbol("minNotional") => minNotional,
    Symbol("maxNotional") => nothing,
    Symbol("maintenanceMarginRate") => self.safeNumber(tier, "maintenanceMargin"),
    Symbol("maxLeverage") => self.parseNumber(stringDiv("1", initialMargin)),
    Symbol("info") => tier
));
        i += 1
    end
    return tiers

end
function parseTransfer(self::Krakenfutures, transfer, currency=nothing)
    datetime = safeString(transfer, "serverTime");
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("currency") => safeString(currency, "code"),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => safeString(transfer, "result")
)

end
function parseAccount(self::Krakenfutures, account)
    accountByType = Dict{Symbol, Any}(
        Symbol("main") => "cash",
        Symbol("funding") => "cash",
        Symbol("future") => "cash",
        Symbol("futures") => "cash",
        Symbol("cashAccount") => "cash",
        Symbol("multiCollateralMarginAccount") => "flex",
        Symbol("multiCollateral") => "flex",
        Symbol("multiCollateralMargin") => "flex"
    );
    if functions.ccxtruthy(ccxt_in(account, accountByType))
            return get(accountByType, Symbol(account), nothing)
    elseif functions.ccxtruthy(ccxt_in(account, self.markets))
        market = self.market(account);
        marketId = get(market, Symbol("id"), nothing);
        splitId = split(marketId, "_");
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
                return string("fi_", safeString(splitId, 1))
        else
            return string("fv_", safeString(splitId, 1))
        end
    else
        return account
    end

end
function transferOut(self::Krakenfutures, code, amount, params=Dict())
    return Base.fetch(self.transfer(code, amount, "future", "spot", params))

end
function transfer(self::Krakenfutures, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    if functions.ccxtruthy(fromAccount == "spot")
        throw(BadRequest(string(self.id, " transfer does not yet support transfers from spot")));
    end
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount
    );
    if functions.ccxtruthy(toAccount == "spot")
        if functions.ccxtruthy(self.parseAccount(fromAccount) != "cash")
            throw(BadRequest(string(self.id, " transfer cannot transfer from ", fromAccount, " to ", toAccount)));
        end
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostWithdrawal(extend(request, params)));
    else
        request[Symbol("fromAccount")] = self.parseAccount(fromAccount);
        request[Symbol("toAccount")] = self.parseAccount(toAccount);
        request[Symbol("unit")] = get(currency, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostTransfer(extend(request, params)));
    end
    transfer = self.parseTransfer(response, currency);
    return extend(transfer, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount
))

end
function setLeverage(self::Krakenfutures, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("maxLeverage") => leverage,
        Symbol("symbol") => uppercase(self.marketId(symbol))
    );
    return Base.fetch(self.privatePutLeveragepreferences(extend(request, params)))

end
function fetchLeverages(self::Krakenfutures, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetLeveragepreferences(params));
    leveragePreferences = self.safeList(response, "leveragePreferences", []);
    return self.parseLeverages(leveragePreferences, symbols, "symbol")

end
function fetchLeverage(self::Krakenfutures, symbol, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => uppercase(self.marketId(symbol))
    );
    response = Base.fetch(self.privateGetLeveragepreferences(extend(request, params)));
    leveragePreferences = self.safeList(response, "leveragePreferences", []);
    data = self.safeDict(leveragePreferences, 0, Dict{Symbol, Any}());
    return self.parseLeverage(data, market)

end
function parseLeverage(self::Krakenfutures, leverage, market=nothing)
    marketId = safeString(leverage, "symbol");
    leverageValue = safeInteger(leverage, "maxLeverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => nothing,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function handleErrors(self::Krakenfutures, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(code == 429)
        throw(DDoSProtection(string(self.id, " ", body)));
    end
    errors = safeValue(response, "errors");
    firstError = safeValue(errors, 0);
    firtErrorMessage = safeString(firstError, "message");
    message = safeString(response, "error", firtErrorMessage);
    if functions.ccxtruthy(message == nothing)
            return nothing
    end
    feedback = string(self.id, " ", body);
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
    self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
    if functions.ccxtruthy(code == 400)
        throw(BadRequest(feedback));
    end
    throw(ExchangeError(feedback));

end
function sign(self::Krakenfutures, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    apiVersions = safeValue(get(self.options, Symbol("versions"), nothing), api, Dict{Symbol, Any}());
    methodVersions = safeValue(apiVersions, method, Dict{Symbol, Any}());
    defaultVersion = safeString(methodVersions, path, self.version);
    version = safeString(params, "version", defaultVersion);
    params = omit(params, "version");
    apiAccess = safeValue(get(self.options, Symbol("access"), nothing), api, Dict{Symbol, Any}());
    methodAccess = safeValue(apiAccess, method, Dict{Symbol, Any}());
    access = safeString(methodAccess, path, "public");
    endpoint = string(version, "/", self.implodeParams(path, params));
    params = omit(params, self.extractParams(path));
    query = endpoint;
    postData = "";
    if functions.ccxtruthy(path == "batchorder")
        postData = string("json=", json(params));
        body = postData;
    elseif functions.ccxtruthy(length(objectKeys(params)))
        if functions.ccxtruthy(ccxt_in("orderIds", params))
            postData = self.urlencodeWithArrayRepeat(params);
        else
            postData = self.urlencode(params);
        end
        query += string("?", postData);
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), query);
    if functions.ccxtruthy(@functions.ccxt_or(api == "private", access == "private"))
        self.checkRequiredCredentials();
        auth = string(postData, "/api/");
        if functions.ccxtruthy(api != "private")
            auth += string(api, "/");
        end
        auth += endpoint;
        hash = Ccxt.hash(self.encode(auth), sha256, "binary");
        secret = self.base64ToBinary(self.secret);
        signature = self.hmac(hash, secret, sha512, "base64");
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded",
            Symbol("Accept") => "application/json",
            Symbol("APIKey") => self.apiKey,
            Symbol("Authent") => signature
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Krakenfutures, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetFeeschedules(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "feeschedules", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetInstruments(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "instruments", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetOrderbook(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "orderbook", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTickers(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetHistory(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetHistoricalfundingrates(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "historicalfundingrates", "public", "GET", params, nothing, nothing, Dict())
end

function privateGetFeeschedulesVolumes(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "feeschedules/volumes", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenpositions(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "openpositions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetNotifications(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "notifications", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccounts(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "accounts", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOpenorders(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "openorders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRecentorders(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "recentorders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFills(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "fills", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTransfers(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "transfers", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetLeveragepreferences(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "leveragepreferences", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetPnlpreferences(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "pnlpreferences", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssignmentprogramCurrent(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "assignmentprogram/current", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssignmentprogramHistory(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "assignmentprogram/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetOrdersStatus(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "orders/status", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostSendorder(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "sendorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEditorder(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "editorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelorder(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "cancelorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransfer(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBatchorder(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "batchorder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelallorders(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "cancelallorders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelallordersafter(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "cancelallordersafter", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawal(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "withdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssignmentprogramAdd(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "assignmentprogram/add", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssignmentprogramDelete(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "assignmentprogram/delete", "private", "POST", params, nothing, nothing, Dict())
end

function privatePutLeveragepreferences(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "leveragepreferences", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutPnlpreferences(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "pnlpreferences", "private", "PUT", params, nothing, nothing, Dict())
end

function chartsGetPriceTypeSymbolInterval(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "{price_type}/{symbol}/{interval}", "charts", "GET", params, nothing, nothing, Dict())
end

function historyGetOrders(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "orders", "history", "GET", params, nothing, nothing, Dict())
end

function historyGetExecutions(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "executions", "history", "GET", params, nothing, nothing, Dict())
end

function historyGetTriggers(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "triggers", "history", "GET", params, nothing, nothing, Dict())
end

function historyGetAccountlogcsv(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "accountlogcsv", "history", "GET", params, nothing, nothing, Dict())
end

function historyGetAccountLog(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "account-log", "history", "GET", params, nothing, nothing, Dict())
end

function historyGetMarketSymbolOrders(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "market/{symbol}/orders", "history", "GET", params, nothing, nothing, Dict())
end

function historyGetMarketSymbolExecutions(self::Krakenfutures, params=Dict(), context=Dict())
    return request(self, "market/{symbol}/executions", "history", "GET", params, nothing, nothing, Dict())
end

function Krakenfutures(; kwargs...)
    inst = Krakenfutures(Exchange(), describe, fetchMarkets, fetchOrderBook, fetchTickers, parseTicker, fetchOHLCV, parseOHLCV, fetchTrades, parseTrade, createOrderRequest, createOrder, createOrders, editOrder, cancelOrder, cancelOrders, cancelAllOrders, cancelAllOrdersAfter, fetchOpenOrders, fetchOrders, fetchOrder, fetchClosedOrders, fetchCanceledOrders, parseOrderType, verifyOrderActionSuccess, parseOrderStatus, parseOrder, fetchMyTrades, fetchBalance, parseBalance, fetchFundingRates, parseFundingRate, fetchFundingRateHistory, fetchPositions, parsePositions, parsePosition, fetchLeverageTiers, parseMarketLeverageTiers, parseTransfer, parseAccount, transferOut, transfer, setLeverage, fetchLeverages, fetchLeverage, parseLeverage, handleErrors, sign, publicGetFeeschedules, publicGetInstruments, publicGetOrderbook, publicGetTickers, publicGetHistory, publicGetHistoricalfundingrates, privateGetFeeschedulesVolumes, privateGetOpenpositions, privateGetNotifications, privateGetAccounts, privateGetOpenorders, privateGetRecentorders, privateGetFills, privateGetTransfers, privateGetLeveragepreferences, privateGetPnlpreferences, privateGetAssignmentprogramCurrent, privateGetAssignmentprogramHistory, privateGetOrdersStatus, privatePostSendorder, privatePostEditorder, privatePostCancelorder, privatePostTransfer, privatePostBatchorder, privatePostCancelallorders, privatePostCancelallordersafter, privatePostWithdrawal, privatePostAssignmentprogramAdd, privatePostAssignmentprogramDelete, privatePutLeveragepreferences, privatePutPnlpreferences, chartsGetPriceTypeSymbolInterval, historyGetOrders, historyGetExecutions, historyGetTriggers, historyGetAccountlogcsv, historyGetAccountLog, historyGetMarketSymbolOrders, historyGetMarketSymbolExecutions)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
