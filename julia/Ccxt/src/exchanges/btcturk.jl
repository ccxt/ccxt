@kwdef mutable struct Btcturk <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCVs::Function = parseOHLCVs
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchMyTrades::Function = fetchMyTrades
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetOrderbook::Function = publicGetOrderbook
    publicGetTicker::Function = publicGetTicker
    publicGetTrades::Function = publicGetTrades
    publicGetOhlc::Function = publicGetOhlc
    publicGetServerExchangeinfo::Function = publicGetServerExchangeinfo
    privateGetUsersBalances::Function = privateGetUsersBalances
    privateGetOpenOrders::Function = privateGetOpenOrders
    privateGetAllOrders::Function = privateGetAllOrders
    privateGetUsersTransactionsTrade::Function = privateGetUsersTransactionsTrade
    privatePostUsersTransactionsCrypto::Function = privatePostUsersTransactionsCrypto
    privatePostUsersTransactionsFiat::Function = privatePostUsersTransactionsFiat
    privatePostOrder::Function = privatePostOrder
    privatePostCancelOrder::Function = privatePostCancelOrder
    privateDeleteOrder::Function = privateDeleteOrder
    graphGetOhlcs::Function = graphGetOhlcs
    graphGetKlinesHistory::Function = graphGetKlinesHistory

end
function describe(self::Btcturk, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "btcturk",
    Symbol("name") => "BTCTurk",
    Symbol("countries") => ["TR"],
    Symbol("rateLimit") => 100,
    Symbol("pro") => false,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
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
        Symbol("createDepositAddress") => false,
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
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
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
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("ws") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => 1,
        Symbol("15m") => 15,
        Symbol("30m") => 30,
        Symbol("1h") => 60,
        Symbol("4h") => 240,
        Symbol("1d") => "1 d",
        Symbol("1w") => "1 w",
        Symbol("1y") => "1 y"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/710711ff-1278-4e7a-9b03-b5503dd85b59",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.btcturk.com/api/v2",
            Symbol("private") => "https://api.btcturk.com/api/v1",
            Symbol("graph") => "https://graph-api.btcturk.com/v1"
        ),
        Symbol("www") => "https://www.btcturk.com",
        Symbol("doc") => "https://github.com/BTCTrader/broker-api-docs"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ohlc") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("server/exchangeinfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("users/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/transactions/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("users/transactions/crypto") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/transactions/fiat") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("graph") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ohlcs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("klines/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
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
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 30,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => nothing,
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 30,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => nothing
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
            Symbol("maker") => self.parseNumber("0.0005"),
            Symbol("taker") => self.parseNumber("0.0009")
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("FAILED_ORDER_WITH_OPEN_ORDERS") => InsufficientFunds,
            Symbol("FAILED_LIMIT_ORDER") => InvalidOrder,
            Symbol("FAILED_MARKET_ORDER") => InvalidOrder
        )
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
"""
retrieves data on all markets for btcturk
see: https://docs.btcturk.com/public-endpoints/exchange-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Btcturk; params=Dict())
    response = Base.fetch(self.publicGetServerExchangeinfo(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    markets = self.safeList(data, "symbols", defaultValue = []);
    return self.parseMarkets(markets)

end
function parseMarket(self::Btcturk, entry)
    id = safeString(entry, "name");
    baseId = safeString(entry, "numerator");
    quoteId = safeString(entry, "denominator");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    filters = self.safeList(entry, "filters", defaultValue = []);
    minPrice = nothing;
    maxPrice = nothing;
    minAmount = nothing;
    maxAmount = nothing;
    minCost = nothing;
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(filters)))
        filter_var = get(filters, j + 1, nothing);
        filterType = safeString(filter_var, "filterType");
        if functions.ccxtruthy(filterType == "PRICE_FILTER")
            minPrice = self.safeNumber(filter_var, "minPrice");
            maxPrice = self.safeNumber(filter_var, "maxPrice");
            minAmount = self.safeNumber(filter_var, "minAmount");
            maxAmount = self.safeNumber(filter_var, "maxAmount");
            minCost = self.safeNumber(filter_var, "minExchangeValue");
        end
        j += 1
    end
    status = safeString(entry, "status");
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
    Symbol("active") => (status == "TRADING"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(entry, "numeratorScale"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(entry, "denominatorScale")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minAmount,
            Symbol("max") => maxAmount
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => minPrice,
            Symbol("max") => maxPrice
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => minCost,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => entry
))

end
function parseBalance(self::Btcturk, response)
    data = self.safeList(response, "data", defaultValue = []);
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        currencyId = safeString(entry, "asset");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(entry, "balance");
        account[Symbol("free")] = safeString(entry, "free");
        account[Symbol("used")] = safeString(entry, "locked");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.btcturk.com/private-endpoints/account-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Btcturk; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetUsersBalances(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.btcturk.com/public-endpoints/orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Btcturk, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pairSymbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetOrderbook(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(data, "timestamp");
    return self.parseOrderBook(data, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = 0, amountKey = 1)

end
function parseTicker(self::Btcturk, ticker; market=nothing)
    marketId = safeString(ticker, "pair");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(ticker, "timestamp");
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
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
    Symbol("change") => safeString(ticker, "daily"),
    Symbol("percentage") => safeString(ticker, "dailyPercent"),
    Symbol("average") => safeString(ticker, "average"),
    Symbol("baseVolume") => safeString(ticker, "volume"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.btcturk.com/public-endpoints/ticker

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Btcturk; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTicker(params));
    tickers = self.safeList(response, "data");
    return self.parseTickers(tickers, symbols = symbols)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.btcturk.com/public-endpoints/ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Btcturk, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    tickers = Base.fetch(self.fetchTickers(symbols = [symbol], params = params));
    return safeValue(tickers, symbol)

end
function parseTrade(self::Btcturk, trade; market=nothing)
    timestamp = safeInteger2(trade, "date", "timestamp");
    id = safeString2(trade, "tid", "id");
    order = safeString(trade, "orderId");
    priceString = safeString(trade, "price");
    amountString = stringAbs(safeString(trade, "amount"));
    marketId = safeString(trade, "pair");
    symbol = self.safeSymbol(marketId, market = market);
    side = safeString2(trade, "side", "orderType");
    fee = nothing;
    feeAmountString = safeString(trade, "fee");
    if functions.ccxtruthy(feeAmountString != nothing)
        feeCurrency = safeString(trade, "denominatorSymbol");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => stringAbs(feeAmountString),
            Symbol("currency") => self.safeCurrencyCode(feeCurrency)
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("order") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://docs.btcturk.com/public-endpoints/trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Btcturk, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pairSymbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("last")] = limit;
    end
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    data = self.safeList(response, "data");
    dataList = [];
    if functions.ccxtruthy(data != nothing)
        dataList = data;
    end
    return self.parseTrades(dataList, market = market, since = since, limit = limit)

end
function parseOHLCV(self::Btcturk, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, "timestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.btcturk.com/public-endpoints/get-kline-data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Btcturk, symbol; timeframe="1h", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("resolution") => safeValue(self.timeframes, timeframe, timeframe)
    );
    until = safeInteger(params, "until", milliseconds());
    request[Symbol("to")] = self.parseToInt((until / 1000));
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.parseToInt(since / 1000);
    elseif functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    if functions.ccxtruthy(limit != nothing)
        limit = min(limit, 11000);
        if functions.ccxtruthy(timeframe == "1y")
            throw(BadRequest(string(self.id, " fetchOHLCV () does not accept a limit parameter when timeframe == \"1y\"")));
        end
        seconds = self.parseTimeframe(timeframe);
        limitSeconds = seconds * (limit - 1);
        if functions.ccxtruthy(since != nothing)
            to = self.parseToInt(since / 1000) + limitSeconds;
            request[Symbol("to")] = min(get(request, Symbol("to"), nothing), to);
        else
            request[Symbol("from")] = self.parseToInt(0 / 1000) - limitSeconds;
        end
    end
    response = Base.fetch(self.graphGetKlinesHistory(extend(request, params)));
    return self.parseOHLCVs(response, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCVs(self::Btcturk, ohlcvs; market=nothing, timeframe="1m", since=nothing, limit=nothing, tail=false)
    results = [];
    timestamp = self.safeList(ohlcvs, "t", defaultValue = []);
    high = self.safeList(ohlcvs, "h", defaultValue = []);
    open = self.safeList(ohlcvs, "o", defaultValue = []);
    low = self.safeList(ohlcvs, "l", defaultValue = []);
    close = self.safeList(ohlcvs, "c", defaultValue = []);
    volume = self.safeList(ohlcvs, "v", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(timestamp)))
        ohlcv = Dict{Symbol, Any}(
            Symbol("timestamp") => safeInteger(timestamp, i),
            Symbol("high") => self.safeNumber(high, i),
            Symbol("open") => self.safeNumber(open, i),
            Symbol("low") => self.safeNumber(low, i),
            Symbol("close") => self.safeNumber(close, i),
            Symbol("volume") => self.safeNumber(volume, i)
        );
        push!(results, self.parseOHLCV(ohlcv, market = market));
        i += 1
    end
    sorted = sortBy(results, 0);
    return self.filterBySinceLimit(sorted, since = since, limit = limit, key = 0, tail = tail)

end
"""
create a trade order
see: https://docs.btcturk.com/private-endpoints/submit-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Btcturk, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("orderType") => side,
        Symbol("orderMethod") => type_var,
        Symbol("pairSymbol") => get(market, Symbol("id"), nothing),
        Symbol("quantity") => self.amountToPrecision(symbol, amount)
    );
    if functions.ccxtruthy(type_var != "market")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(ccxt_in("clientOrderId", params))
        request[Symbol("newClientOrderId")] = get(params, Symbol("clientOrderId"), nothing);
    elseif functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("newClientOrderId", params))))
        request[Symbol("newClientOrderId")] = uuid();
    end
    response = Base.fetch(self.privatePostOrder(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
cancels an open order
see: https://docs.btcturk.com/private-endpoints/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Btcturk, id; symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privateDeleteOrder(extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
"""
fetch all unfilled currently open orders
see: https://docs.btcturk.com/private-endpoints/open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Btcturk; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pairSymbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetOpenOrders(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    bids = self.safeList(data, "bids", defaultValue = []);
    asks = self.safeList(data, "asks", defaultValue = []);
    return self.parseOrders(arrayConcat(bids, asks), market = market, since = since, limit = limit)

end
"""
fetches information on multiple orders made by the user
see: https://docs.btcturk.com/private-endpoints/all-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Btcturk; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pairSymbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("last")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = floor(since / 1000);
    end
    response = Base.fetch(self.privateGetAllOrders(extend(request, params)));
    data = self.safeList(response, "data");
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
function parseOrderStatus(self::Btcturk, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Untouched") => "open",
        Symbol("Partial") => "open",
        Symbol("Canceled") => "canceled",
        Symbol("Closed") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Btcturk, order; market=nothing)
    id = safeString(order, "id");
    price = safeString(order, "price");
    amountString = safeString2(order, "amount", "quantity");
    amount = stringAbs(amountString);
    remaining = safeString(order, "leftAmount");
    marketId = safeString(order, "pairSymbol");
    symbol = self.safeSymbol(marketId, market = market);
    side = safeString(order, "type");
    type_var = safeString(order, "method");
    clientOrderId = safeString(order, "orderClientId");
    timestamp = safeInteger2(order, "updateTime", "datetime");
    rawStatus = safeString(order, "status");
    status = self.parseOrderStatus(rawStatus);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("remaining") => remaining,
    Symbol("filled") => nothing,
    Symbol("cost") => nothing,
    Symbol("average") => nothing,
    Symbol("status") => status,
    Symbol("side") => side,
    Symbol("type") => type_var,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("fee") => nothing
), market = market)

end
"""
fetch all trades made by the user
see: https://docs.btcturk.com/private-endpoints/user-transactions

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Btcturk; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privateGetUsersTransactionsTrade());
    data = self.safeList(response, "data");
    dataList = [];
    if functions.ccxtruthy(data != nothing)
        dataList = data;
    end
    return self.parseTrades(dataList, market = market, since = since, limit = limit)

end
function nonce(self::Btcturk, )
    return milliseconds()

end
function sign(self::Btcturk, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    if functions.ccxtruthy(self.id == "btctrader")
        throw(ExchangeError(string(self.id, " is an abstract base API for BTCExchange, BTCTurk")));
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", path);
    if functions.ccxtruthy(@functions.ccxt_or((method == "GET"), (method == "DELETE")))
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    else
        body = json(params);
    end
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        nonce = string(self.nonce());
        secret = self.base64ToBinary(self.secret);
        auth = string(self.apiKey, nonce);
        headers = Dict{Symbol, Any}(
            Symbol("X-PCK") => self.apiKey,
            Symbol("X-Stamp") => nonce,
            Symbol("X-Signature") => self.hmac(self.encode(auth), secret, sha256, "base64"),
            Symbol("Content-Type") => "application/json"
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Btcturk, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    errorCode = safeString(response, "code", "0");
    message = safeString(response, "message");
    output = functions.ccxtruthy((message == nothing)) ? body : message;
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, string(self.id, " ", output));
    if functions.ccxtruthy(@functions.ccxt_and((errorCode != "0"), (errorCode != "SUCCESS")))
        throw(ExchangeError(string(self.id, " ", output)));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Btcturk, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetOrderbook(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTrades(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOhlc(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "ohlc"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetServerExchangeinfo(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "server/exchangeinfo"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUsersBalances(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "users/balances"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOpenOrders(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "openOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAllOrders(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "allOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUsersTransactionsTrade(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "users/transactions/trade"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUsersTransactionsCrypto(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "users/transactions/crypto"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUsersTransactionsFiat(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "users/transactions/fiat"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrder(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelOrder(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "cancelOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrder(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function graphGetOhlcs(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "ohlcs"; api="graph", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function graphGetKlinesHistory(self::Btcturk, params=Dict(), context=Dict())
    return request(self, "klines/history"; api="graph", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function Btcturk(; kwargs...)
    inst = Btcturk(Exchange(), describe, fetchMarkets, parseMarket, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTickers, fetchTicker, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, parseOHLCVs, createOrder, cancelOrder, fetchOpenOrders, fetchOrders, parseOrderStatus, parseOrder, fetchMyTrades, nonce, sign, handleErrors, publicGetOrderbook, publicGetTicker, publicGetTrades, publicGetOhlc, publicGetServerExchangeinfo, privateGetUsersBalances, privateGetOpenOrders, privateGetAllOrders, privateGetUsersTransactionsTrade, privatePostUsersTransactionsCrypto, privatePostUsersTransactionsFiat, privatePostOrder, privatePostCancelOrder, privateDeleteOrder, graphGetOhlcs, graphGetKlinesHistory)
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
function __ccxt_doc_Btcturk_fetchMarkets() end
"""
retrieves data on all markets for btcturk
see: https://docs.btcturk.com/public-endpoints/exchange-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Btcturk_fetchMarkets

function __ccxt_doc_Btcturk_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.btcturk.com/private-endpoints/account-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Btcturk_fetchBalance

function __ccxt_doc_Btcturk_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.btcturk.com/public-endpoints/orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Btcturk_fetchOrderBook

function __ccxt_doc_Btcturk_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.btcturk.com/public-endpoints/ticker

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Btcturk_fetchTickers

function __ccxt_doc_Btcturk_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.btcturk.com/public-endpoints/ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Btcturk_fetchTicker

function __ccxt_doc_Btcturk_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://docs.btcturk.com/public-endpoints/trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Btcturk_fetchTrades

function __ccxt_doc_Btcturk_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.btcturk.com/public-endpoints/get-kline-data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Btcturk_fetchOHLCV

function __ccxt_doc_Btcturk_createOrder() end
"""
create a trade order
see: https://docs.btcturk.com/private-endpoints/submit-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Btcturk_createOrder

function __ccxt_doc_Btcturk_cancelOrder() end
"""
cancels an open order
see: https://docs.btcturk.com/private-endpoints/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by cancelOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Btcturk_cancelOrder

function __ccxt_doc_Btcturk_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.btcturk.com/private-endpoints/open-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Btcturk_fetchOpenOrders

function __ccxt_doc_Btcturk_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://docs.btcturk.com/private-endpoints/all-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Btcturk_fetchOrders

function __ccxt_doc_Btcturk_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.btcturk.com/private-endpoints/user-transactions

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Btcturk_fetchMyTrades
