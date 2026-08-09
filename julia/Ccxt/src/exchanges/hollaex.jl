@kwdef mutable struct Hollaex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchOrderBooks::Function = fetchOrderBooks
    fetchOrderBook::Function = fetchOrderBook
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTickers::Function = parseTickers
    parseTicker::Function = parseTicker
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchTradingFees::Function = fetchTradingFees
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOpenOrder::Function = fetchOpenOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchMyTrades::Function = fetchMyTrades
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddresses::Function = fetchDepositAddresses
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawal::Function = fetchWithdrawal
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    withdraw::Function = withdraw
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetHealth::Function = publicGetHealth
    publicGetConstants::Function = publicGetConstants
    publicGetKit::Function = publicGetKit
    publicGetTiers::Function = publicGetTiers
    publicGetTicker::Function = publicGetTicker
    publicGetTickers::Function = publicGetTickers
    publicGetOrderbook::Function = publicGetOrderbook
    publicGetOrderbooks::Function = publicGetOrderbooks
    publicGetTrades::Function = publicGetTrades
    publicGetChart::Function = publicGetChart
    publicGetCharts::Function = publicGetCharts
    publicGetMinicharts::Function = publicGetMinicharts
    publicGetOraclePrices::Function = publicGetOraclePrices
    publicGetQuickTrade::Function = publicGetQuickTrade
    publicGetUdfConfig::Function = publicGetUdfConfig
    publicGetUdfHistory::Function = publicGetUdfHistory
    publicGetUdfSymbols::Function = publicGetUdfSymbols
    privateGetUser::Function = privateGetUser
    privateGetUserBalance::Function = privateGetUserBalance
    privateGetUserDeposits::Function = privateGetUserDeposits
    privateGetUserWithdrawals::Function = privateGetUserWithdrawals
    privateGetUserWithdrawalFee::Function = privateGetUserWithdrawalFee
    privateGetUserTrades::Function = privateGetUserTrades
    privateGetOrders::Function = privateGetOrders
    privateGetOrder::Function = privateGetOrder
    privatePostUserWithdrawal::Function = privatePostUserWithdrawal
    privatePostOrder::Function = privatePostOrder
    privateDeleteOrderAll::Function = privateDeleteOrderAll
    privateDeleteOrder::Function = privateDeleteOrder

end
function describe(self::Hollaex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "hollaex",
    Symbol("name") => "HollaEx",
    Symbol("countries") => ["KR"],
    Symbol("rateLimit") => 250,
    Symbol("version") => "v2",
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("createLimitBuyOrder") => true,
        Symbol("createLimitSellOrder") => true,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketSellOrder") => true,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => "emulated",
        Symbol("fetchDepositAddresses") => true,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawal") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("1h") => "1h",
        Symbol("4h") => "4h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg",
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.sandbox.hollaex.com"
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://api.hollaex.com"
        ),
        Symbol("www") => "https://hollaex.com",
        Symbol("doc") => "https://apidocs.hollaex.com",
        Symbol("referral") => "https://pro.hollaex.com/signup?affiliation_code=QSWA6G"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("health") => 1,
                Symbol("constants") => 1,
                Symbol("kit") => 1,
                Symbol("tiers") => 1,
                Symbol("ticker") => 1,
                Symbol("tickers") => 1,
                Symbol("orderbook") => 1,
                Symbol("orderbooks") => 1,
                Symbol("trades") => 1,
                Symbol("chart") => 1,
                Symbol("charts") => 1,
                Symbol("minicharts") => 1,
                Symbol("oracle/prices") => 1,
                Symbol("quick-trade") => 1,
                Symbol("udf/config") => 1,
                Symbol("udf/history") => 1,
                Symbol("udf/symbols") => 1
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("user") => 1,
                Symbol("user/balance") => 1,
                Symbol("user/deposits") => 1,
                Symbol("user/withdrawals") => 1,
                Symbol("user/withdrawal/fee") => 1,
                Symbol("user/trades") => 1,
                Symbol("orders") => 1,
                Symbol("order") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("user/withdrawal") => 1,
                Symbol("order") => 1
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order/all") => 1,
                Symbol("order") => 1
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
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
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
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
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => 0.001,
            Symbol("maker") => 0.001
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("API request is expired") => InvalidNonce,
            Symbol("Invalid token") => AuthenticationError,
            Symbol("Order not found") => OrderNotFound,
            Symbol("Insufficient balance") => InsufficientFunds,
            Symbol("Error 1001 - Order rejected. Order could not be submitted as this order was set to a post only order.") => OrderImmediatelyFillable
        ),
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("400") => BadRequest,
            Symbol("403") => AuthenticationError,
            Symbol("404") => BadRequest,
            Symbol("405") => BadRequest,
            Symbol("410") => BadRequest,
            Symbol("429") => BadRequest,
            Symbol("500") => NetworkError,
            Symbol("503") => NetworkError
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("api-expires") => self.parseToInt(self.timeout / 1000),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "btc",
            Symbol("ETH") => "eth",
            Symbol("ERC20") => "eth",
            Symbol("TRX") => "trx",
            Symbol("TRC20") => "trx",
            Symbol("XRP") => "xrp",
            Symbol("XLM") => "xlm",
            Symbol("BNB") => "bnb",
            Symbol("MATIC") => "matic"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("eth") => "ERC20",
            Symbol("ETH") => "ERC20",
            Symbol("ERC20") => "ERC20",
            Symbol("trx") => "TRC20",
            Symbol("TRX") => "TRC20",
            Symbol("TRC20") => "TRC20"
        )
    )
))

end
function fetchMarkets(self::Hollaex, params=Dict())
    response = Base.fetch(self.publicGetConstants(params));
    pairs_var = safeValue(response, "pairs", Dict{Symbol, Any}());
    keys_var = objectKeys(pairs_var);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        market = get(pairs_var, Symbol(key), nothing);
        baseId = safeString(market, "pair_base");
        quoteId = safeString(market, "pair_2");
        base = self.commonCurrencyCode(uppercase(baseId));
        quote_var = self.commonCurrencyCode(uppercase(quoteId));
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => safeString(market, "name"),
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
    Symbol("active") => safeValue(market, "active"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "increment_size"),
        Symbol("price") => self.safeNumber(market, "increment_price")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_size"),
            Symbol("max") => self.safeNumber(market, "max_size")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_price"),
            Symbol("max") => self.safeNumber(market, "max_price")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => self.parse8601(safeString(market, "created_at")),
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function fetchCurrencies(self::Hollaex, params=Dict())
    response = Base.fetch(self.publicGetConstants(params));
    coins = self.safeDict(response, "coins", Dict{Symbol, Any}());
    values_var = objectValues(coins);
    return self.parseCurrencies(values_var)

end
function parseCurrency(self::Hollaex, rawCurrency)
    id = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(id);
    withdrawalLimits = self.safeList(rawCurrency, "withdrawal_limits", []);
    rawType = safeString(rawCurrency, "type");
    type_var = functions.ccxtruthy((rawType == "blockchain")) ? "crypto" : "other";
    rawNetworks = self.safeDict(rawCurrency, "withdrawal_fees", Dict{Symbol, Any}());
    networks = Dict{Symbol, Any}();
    networkIds = objectKeys(rawNetworks);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkIds)))
        networkId = get(networkIds, j + 1, nothing);
        networkEntry = self.safeDict(rawNetworks, networkId);
        networkCode = self.networkIdToCode(networkId, code);
        networks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("active") => self.safeBool(networkEntry, "active"),
            Symbol("deposit") => nothing,
            Symbol("withdraw") => nothing,
            Symbol("fee") => self.safeNumber(networkEntry, "value"),
            Symbol("precision") => nothing,
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                )
            ),
            Symbol("info") => networkEntry
        );
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("numericId") => safeInteger(rawCurrency, "id"),
    Symbol("code") => code,
    Symbol("info") => rawCurrency,
    Symbol("name") => safeString(rawCurrency, "fullname"),
    Symbol("active") => self.safeBool(rawCurrency, "active"),
    Symbol("deposit") => self.safeBool(rawCurrency, "allow_deposit"),
    Symbol("withdraw") => self.safeBool(rawCurrency, "allow_withdrawal"),
    Symbol("fee") => self.safeNumber(rawCurrency, "withdrawal_fee"),
    Symbol("precision") => self.safeNumber(rawCurrency, "increment_unit"),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(rawCurrency, "min"),
            Symbol("max") => self.safeNumber(rawCurrency, "max")
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => safeValue(withdrawalLimits, 0)
        )
    ),
    Symbol("networks") => networks,
    Symbol("type") => type_var
))

end
function fetchOrderBooks(self::Hollaex, symbols=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetOrderbooks(params));
    result = Dict{Symbol, Any}();
    marketIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        orderbook = get(response, Symbol(marketId), nothing);
        symbol = self.safeSymbol(marketId, nothing, "-");
        timestamp = self.parse8601(safeString(orderbook, "timestamp"));
        result[Symbol(symbol)] = self.parseOrderBook(get(response, Symbol(marketId), nothing), symbol, timestamp);
        i += 1
    end
    return result

end
function fetchOrderBook(self::Hollaex, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetOrderbook(extend(request, params)));
    orderbook = safeValue(response, get(market, Symbol("id"), nothing));
    timestamp = self.parse8601(safeString(orderbook, "timestamp"));
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp)

end
function fetchTicker(self::Hollaex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    return self.parseTicker(response, market)

end
function fetchTickers(self::Hollaex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    response = Base.fetch(self.publicGetTickers(params));
    return self.parseTickers(response, symbols)

end
function parseTickers(self::Hollaex, tickers, symbols=nothing, params=Dict())
    result = Dict{Symbol, Any}();
    keys_var = objectKeys(tickers);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        ticker = get(tickers, Symbol(key), nothing);
        marketId = safeString(ticker, "symbol", key);
        market = self.safeMarket(marketId, nothing, "-");
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = extend(self.parseTicker(ticker, market), params);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", symbols)

end
function parseTicker(self::Hollaex, ticker, market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId, market, "-");
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = self.parse8601(safeString2(ticker, "time", "timestamp"));
    close = safeString(ticker, "close");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("info") => ticker,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => close,
    Symbol("last") => safeString(ticker, "last", close),
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "volume"),
    Symbol("quoteVolume") => nothing
), market)

end
function fetchTrades(self::Hollaex, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    trades = self.safeList(response, get(market, Symbol("id"), nothing), []);
    return self.parseTrades(trades, market, since, limit)

end
function parseTrade(self::Hollaex, trade, market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId, market, "-");
    symbol = get(market, Symbol("symbol"), nothing);
    datetime = safeString(trade, "timestamp");
    timestamp = self.parse8601(datetime);
    side = safeString(trade, "side");
    orderId = safeString(trade, "order_id");
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "size");
    feeCostString = safeString(trade, "fee");
    feeCoin = safeString(trade, "fee_coin");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => self.safeCurrencyCode(feeCoin)
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function fetchTradingFees(self::Hollaex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTiers(params));
    firstTier = safeValue(response, "1", Dict{Symbol, Any}());
    fees = safeValue(firstTier, "fees", Dict{Symbol, Any}());
    makerFees = safeValue(fees, "maker", Dict{Symbol, Any}());
    takerFees = safeValue(fees, "taker", Dict{Symbol, Any}());
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(self.symbols)))
        symbol = get(self.symbols, i + 1, nothing);
        market = self.market(symbol);
        makerString = safeString(makerFees, get(market, Symbol("id"), nothing));
        takerString = safeString(takerFees, get(market, Symbol("id"), nothing));
        result[Symbol(symbol)] = Dict{Symbol, Any}(
            Symbol("info") => fees,
            Symbol("symbol") => symbol,
            Symbol("maker") => self.parseNumber(stringDiv(makerString, "100")),
            Symbol("taker") => self.parseNumber(stringDiv(takerString, "100")),
            Symbol("percentage") => true,
            Symbol("tierBased") => true
        );
        i += 1
    end
    return result

end
function fetchOHLCV(self::Hollaex, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe)
    );
    paginate = false;
    maxLimit = 500;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", paginate);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, maxLimit))
    end
    until = safeInteger(params, "until");
    timeDelta = self.parseTimeframe(timeframe) * maxLimit * 1000;
    start = since;
    now = milliseconds();
    if functions.ccxtruthy(until == nothing)
        until = now;
    end
    if functions.ccxtruthy(start == nothing)
        start = until - timeDelta;
    end
    request[Symbol("from")] = self.parseToInt(start / 1000);
    request[Symbol("to")] = self.parseToInt(until / 1000);
    params = omit(params, "until");
    response = Base.fetch(self.publicGetChart(extend(request, params)));
    return self.parseOHLCVs(response, market, timeframe, since, limit)

end
function parseOHLCV(self::Hollaex, ohlcv, market=nothing)
    return [self.parse8601(safeString(ohlcv, "time")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function parseBalance(self::Hollaex, response)
    timestamp = self.parse8601(safeString(response, "updated_at"));
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    currencyIds = objectKeys(self.currencies_by_id);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(response, string(currencyId, "_available"));
        account[Symbol("total")] = safeString(response, string(currencyId, "_balance"));
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Hollaex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetUserBalance(params));
    return self.parseBalance(response)

end
function fetchOpenOrder(self::Hollaex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateGetOrder(extend(request, params)));
    return self.parseOrder(response)

end
function fetchOpenOrders(self::Hollaex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("open") => true
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function fetchClosedOrders(self::Hollaex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("open") => false
    );
    return Base.fetch(self.fetchOrders(symbol, since, limit, extend(request, params)))

end
function fetchOrder(self::Hollaex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateGetOrder(extend(request, params)));
    order = response;
    if functions.ccxtruthy(order == nothing)
        throw(OrderNotFound(string(self.id, " fetchOrder() could not find order id ", id)));
    end
    return self.parseOrder(order)

end
function fetchOrders(self::Hollaex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetOrders(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function parseOrderStatus(self::Hollaex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("new") => "open",
        Symbol("pfilled") => "open",
        Symbol("filled") => "closed",
        Symbol("canceled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Hollaex, order, market=nothing)
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market, "-");
    id = safeString(order, "id");
    timestamp = self.parse8601(safeString(order, "created_at"));
    type_var = safeString(order, "type");
    side = safeString(order, "side");
    price = safeString(order, "price");
    amount = safeString(order, "size");
    filled = safeString(order, "filled");
    status = self.parseOrderStatus(safeString(order, "status"));
    meta = safeValue(order, "meta", Dict{Symbol, Any}());
    postOnly = self.safeBool(meta, "post_only", false);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => safeString(order, "stop"),
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => order,
    Symbol("average") => nothing
), market)

end
function createOrder(self::Hollaex, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("size") => self.amountToPrecision(symbol, amount),
        Symbol("type") => type_var
    );
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "stop"]);
    meta = safeValue(params, "meta", Dict{Symbol, Any}());
    exchangeSpecificParam = self.safeBool(meta, "post_only", false);
    isMarketOrder = type_var == "market";
    postOnly = self.isPostOnly(isMarketOrder, exchangeSpecificParam, params);
    if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stop")] = self.priceToPrecision(symbol, triggerPrice);
    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("meta")] = Dict{Symbol, Any}(
            Symbol("post_only") => true
        );
    end
    params = omit(params, ["postOnly", "timeInForce", "stopPrice", "triggerPrice", "stop"]);
    response = Base.fetch(self.privatePostOrder(extend(request, params)));
    return self.parseOrder(response, market)

end
function cancelOrder(self::Hollaex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateDeleteOrder(extend(request, params)));
    return self.parseOrder(response)

end
function cancelAllOrders(self::Hollaex, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    market = self.market(symbol);
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    response = Base.fetch(self.privateDeleteOrderAll(extend(request, params)));
    return self.parseOrders(response, market)

end
function fetchMyTrades(self::Hollaex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    response = Base.fetch(self.privateGetUserTrades(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function parseDepositAddress(self::Hollaex, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    tag = nothing;
    if functions.ccxtruthy(address != nothing)
        parts = split(address, ":");
        address = safeString(parts, 0);
        tag = safeString(parts, 1);
    end
    self.checkAddress(address);
    currencyId = safeString(depositAddress, "currency");
    currency = self.safeCurrency(currencyId, currency);
    network = safeString(depositAddress, "network");
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("network") => network,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function fetchDepositAddresses(self::Hollaex, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    network = safeString(params, "network");
    params = omit(params, "network");
    response = Base.fetch(self.privateGetUser(params));
    wallet = safeValue(response, "wallet", []);
    addresses = functions.ccxtruthy((network == nothing)) ? wallet : filterBy(wallet, "network", network);
    return self.parseDepositAddresses(addresses, codes)

end
function fetchDeposits(self::Hollaex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    response = Base.fetch(self.privateGetUserDeposits(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function fetchWithdrawal(self::Hollaex, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("transaction_id") => id
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetUserWithdrawals(extend(request, params)));
    data = safeValue(response, "data", []);
    transaction = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTransaction(transaction, currency)

end
function fetchWithdrawals(self::Hollaex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_date")] = self.iso8601(since);
    end
    response = Base.fetch(self.privateGetUserWithdrawals(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function parseTransaction(self::Hollaex, transaction, currency=nothing)
    id = safeString(transaction, "id");
    txid = safeString(transaction, "transaction_id");
    timestamp = self.parse8601(safeString(transaction, "created_at"));
    updated = self.parse8601(safeString(transaction, "updated_at"));
    type_var = safeString(transaction, "type");
    amount = self.safeNumber(transaction, "amount");
    address = safeString(transaction, "address");
    addressTo = nothing;
    addressFrom = nothing;
    tag = nothing;
    tagTo = nothing;
    tagFrom = nothing;
    if functions.ccxtruthy(address != nothing)
        parts = split(address, ":");
        address = safeString(parts, 0);
        tag = safeString(parts, 1);
        addressTo = address;
        tagTo = tag;
    end
    currencyId = safeString(transaction, "currency");
    currency = self.safeCurrency(currencyId, currency);
    status = safeValue(transaction, "status");
    dismissed = safeValue(transaction, "dismissed");
    rejected = safeValue(transaction, "rejected");
    if functions.ccxtruthy(status)
        status = "ok";
    elseif functions.ccxtruthy(dismissed)
        status = "canceled";
    else
        if functions.ccxtruthy(rejected)
            status = "failed";
        else
            status = "pending";
        end

    end
    feeCurrencyId = safeString(transaction, "fee_coin");
    feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId, currency);
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => feeCurrencyCode,
            Symbol("cost") => feeCost
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("addressFrom") => addressFrom,
    Symbol("address") => address,
    Symbol("addressTo") => addressTo,
    Symbol("tagFrom") => tagFrom,
    Symbol("tag") => tag,
    Symbol("tagTo") => tagTo,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("comment") => safeString(transaction, "message"),
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
function withdraw(self::Hollaex, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    if functions.ccxtruthy(tag != nothing)
        address += string(":", tag);
    end
    network = safeString(params, "network");
    if functions.ccxtruthy(network == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw() requires a network parameter")));
    end
    params = omit(params, "network");
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("address") => address,
        Symbol("network") => self.networkCodeToId(network, code)
    );
    response = Base.fetch(self.privatePostUserWithdrawal(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function parseDepositWithdrawFee(self::Hollaex, fee, currency=nothing)
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
    allowWithdrawal = safeValue(fee, "allow_withdrawal");
    if functions.ccxtruthy(allowWithdrawal)
        result[Symbol("withdraw")] = Dict{Symbol, Any}(
            Symbol("fee") => self.safeNumber(fee, "withdrawal_fee"),
            Symbol("percentage") => false
        );
    end
    withdrawalFees = safeValue(fee, "withdrawal_fees");
    if functions.ccxtruthy(withdrawalFees != nothing)
        keys_var = objectKeys(withdrawalFees);
        keysLength = length(keys_var);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, keysLength))
            key = get(keys_var, i + 1, nothing);
            value = get(withdrawalFees, Symbol(key), nothing);
            currencyId = safeString(value, "symbol");
            currencyCode = self.safeCurrencyCode(currencyId);
            networkCode = self.networkIdToCode(key, currencyCode);
            networkCodeUpper = uppercase(networkCode);
            withdrawalFee = self.safeNumber(value, "value");
            result[Symbol("networks")][Symbol(networkCodeUpper)] = Dict{Symbol, Any}(
                Symbol("deposit") => nothing,
                Symbol("withdraw") => withdrawalFee
            );
            i += 1
        end

    end
    return result

end
function fetchDepositWithdrawFees(self::Hollaex, codes=nothing, params=Dict())
    response = Base.fetch(self.publicGetConstants(params));
    coins = self.safeDict(response, "coins", Dict{Symbol, Any}());
    return self.parseDepositWithdrawFees(coins, codes, "symbol")

end
function sign(self::Hollaex, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    query = omit(params, self.extractParams(path));
    path = string("/", self.version, "/", self.implodeParams(path, params));
    if functions.ccxtruthy(@functions.ccxt_or((method == "GET"), (method == "DELETE")))
        if functions.ccxtruthy(length(objectKeys(query)))
            path += string("?", self.urlencode(query));
        end
    end
    url = get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing) + path;
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        defaultExpires = safeInteger2(self.options, "api-expires", "expires", self.parseToInt(self.timeout / 1000));
        expires = self.sum(seconds(), defaultExpires);
        expiresString = string(expires);
        auth = string(method, path, expiresString);
        headers = Dict{Symbol, Any}(
            Symbol("api-key") => self.apiKey,
            Symbol("api-expires") => expiresString
        );
        if functions.ccxtruthy(method == "POST")
            headers[Symbol("Content-type")] = "application/json";
            if functions.ccxtruthy(length(objectKeys(query)))
                body = json(query);
                auth += body;
            end
        end
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
        headers[Symbol("api-signature")] = signature;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Hollaex, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_ge(code, 400)), (functions.ccxt_le(code, 503))))
        feedback = string(self.id, " ", body);
        message = safeString(response, "message");
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        status = string(code);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), status, feedback);
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Hollaex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetHealth(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "health", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetConstants(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "constants", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetKit(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "kit", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTiers(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "tiers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTicker(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "ticker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTickers(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "tickers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetOrderbook(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "orderbook", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetOrderbooks(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "orderbooks", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetTrades(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "trades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetChart(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "chart", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetCharts(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "charts", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetMinicharts(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "minicharts", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetOraclePrices(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "oracle/prices", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetQuickTrade(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "quick-trade", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetUdfConfig(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "udf/config", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetUdfHistory(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "udf/history", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetUdfSymbols(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "udf/symbols", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUser(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUserBalance(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUserDeposits(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/deposits", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUserWithdrawals(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/withdrawals", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUserWithdrawalFee(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/withdrawal/fee", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUserTrades(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetOrders(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetOrder(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostUserWithdrawal(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/withdrawal", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrder(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOrderAll(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "order/all", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateDeleteOrder(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "order", "private", "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Hollaex(; kwargs...)
    inst = Hollaex(Exchange(), describe, fetchMarkets, fetchCurrencies, parseCurrency, fetchOrderBooks, fetchOrderBook, fetchTicker, fetchTickers, parseTickers, parseTicker, fetchTrades, parseTrade, fetchTradingFees, fetchOHLCV, parseOHLCV, parseBalance, fetchBalance, fetchOpenOrder, fetchOpenOrders, fetchClosedOrders, fetchOrder, fetchOrders, parseOrderStatus, parseOrder, createOrder, cancelOrder, cancelAllOrders, fetchMyTrades, parseDepositAddress, fetchDepositAddresses, fetchDeposits, fetchWithdrawal, fetchWithdrawals, parseTransaction, withdraw, parseDepositWithdrawFee, fetchDepositWithdrawFees, sign, handleErrors, publicGetHealth, publicGetConstants, publicGetKit, publicGetTiers, publicGetTicker, publicGetTickers, publicGetOrderbook, publicGetOrderbooks, publicGetTrades, publicGetChart, publicGetCharts, publicGetMinicharts, publicGetOraclePrices, publicGetQuickTrade, publicGetUdfConfig, publicGetUdfHistory, publicGetUdfSymbols, privateGetUser, privateGetUserBalance, privateGetUserDeposits, privateGetUserWithdrawals, privateGetUserWithdrawalFee, privateGetUserTrades, privateGetOrders, privateGetOrder, privatePostUserWithdrawal, privatePostOrder, privateDeleteOrderAll, privateDeleteOrder)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
