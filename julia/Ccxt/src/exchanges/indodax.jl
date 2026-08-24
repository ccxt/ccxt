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
    fetchDepositWithdrawFee::Function = fetchDepositWithdrawFee
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
        Symbol("fetchDepositWithdrawFee") => true,
        Symbol("fetchDepositWithdrawFees") => false,
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
        Symbol("fetchOHLCV") => true,
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
        Symbol("fetchTickers") => true,
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
                Symbol("api/server_time") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/price_increments") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/summaries") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/ticker/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/ticker_all") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/trades/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/depth/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("tradingview/history_v2") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("getInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("transHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradeHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("orderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("getOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("withdrawFee") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("withdrawCoin") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("listDownline") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("checkDownline") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("createVoucher") => Dict{Symbol, Any}(
    Symbol("cost") => 4
)
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
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Indodax; params=Dict())
    response = Base.fetch(self.publicGetApiServerTime(params));
    return safeInteger(response, "server_time")

end
"""
retrieves data on all markets for indodax
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#pairs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Indodax; params=Dict())
    response = Base.fetch(self.publicGetApiPairs(params));
    result = [];
    rawMarkets = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawMarkets)))
        market = get(rawMarkets, i + 1, nothing);
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
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "price_round"))),
        Symbol("cost") => self.parseNumber(self.parsePrecision(precision = safeString(market, "volume_precision")))
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
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#get-info-endpoint

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Indodax; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetInfo(params));
    return self.parseBalance(response)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#depth

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Indodax, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    orderbook = Base.fetch(self.publicGetApiDepthPair(extend(request, params)));
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "buy", asksKey = "sell")

end
function parseTicker(self::Indodax, ticker; market=nothing)
    symbol = self.safeSymbol(nothing, market = market);
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
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Indodax, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetApiTickerPair(extend(request, params)));
    ticker = self.safeDict(response, "ticker", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(ticker, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker-all

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Indodax; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetApiTickerAll(params));
    tickers = self.safeDict(response, "tickers", defaultValue = Dict{Symbol, Any}());
    keys_var = objectKeys(tickers);
    parsedTickers = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        rawTicker = get(tickers, Symbol(key), nothing);
        marketId = replace(key, "_" => "");
        market = self.safeMarket(marketId = marketId);
        parsed = self.parseTicker(rawTicker, market = market);
        parsedTickers[Symbol(marketId)] = parsed;
        i += 1
    end
    return self.filterByArray(parsedTickers, "symbol", values = symbols)

end
function parseTrade(self::Indodax, trade; market=nothing)
    timestamp = safeTimestamp(trade, "date");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString(trade, "tid"),
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("type") => nothing,
    Symbol("side") => safeString(trade, "type"),
    Symbol("order") => nothing,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "amount"),
    Symbol("cost") => nothing,
    Symbol("fee") => nothing
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Indodax, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetApiTradesPair(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
function parseOHLCV(self::Indodax, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, "Time"), self.safeNumber(ohlcv, "Open"), self.safeNumber(ohlcv, "High"), self.safeNumber(ohlcv, "Low"), self.safeNumber(ohlcv, "Close"), self.safeNumber(ohlcv, "Volume")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

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
function fetchOHLCV(self::Indodax, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    return self.parseOHLCVs(toArray(response), market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOrderStatus(self::Indodax, status)
    statuses = Dict{Symbol, Any}(
        Symbol("open") => "open",
        Symbol("filled") => "closed",
        Symbol("cancelled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Indodax, order; market=nothing)
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
    filled = nothing;
    marketId = safeString(order, "pair");
    market = self.safeMarket(marketId = marketId, market = market);
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
        amount = safeString(order, string("order_", baseId));
        remaining = safeString(order, string("remain_", baseId));
        filled = safeString(order, string("receive_", baseId));
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
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
))

end
"""
fetches information on an order made by the user
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#get-order-endpoints

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Indodax, id; symbol=nothing, params=Dict())
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
    orders = self.safeDict(response, "return", defaultValue = Dict{Symbol, Any}());
    order = self.parseOrder(extend(Dict{Symbol, Any}(
        Symbol("id") => id
    ), get(orders, Symbol("order"), nothing)), market = market);
    order[Symbol("info")] = response;
    return order

end
"""
fetch all unfilled currently open orders
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#open-orders-endpoints

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Indodax; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    openOrdersResult = self.safeDict(response, "return", defaultValue = Dict{Symbol, Any}());
    rawOrders = get(openOrdersResult, Symbol("orders"), nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(rawOrders))
            return []
    end
    if functions.ccxtruthy(symbol != nothing)
            return self.parseOrders(rawOrders, market = market, since = since, limit = limit)
    end
    marketIds = objectKeys(rawOrders);
    exchangeOrders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        marketOrders = get(rawOrders, Symbol(marketId), nothing);
        market = self.safeMarket(marketId = marketId);
        parsedOrders = self.parseOrders(marketOrders, market = market, since = since, limit = limit);
        exchangeOrders = arrayConcat(exchangeOrders, parsedOrders);
        i += 1
    end
    return exchangeOrders

end
"""
fetches information on multiple closed orders made by the user
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Indodax; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    historyResult = self.safeDict(response, "return", defaultValue = Dict{Symbol, Any}());
    orders = self.parseOrders(get(historyResult, Symbol("orders"), nothing), market = market);
    orders = filterBy(orders, "status", "closed");
    return self.filterBySymbolSinceLimit(orders, symbol = symbol, since = since, limit = limit)

end
"""
create a trade order
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#trade-endpoints

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
function createOrder(self::Indodax, symbol, type_var, side, amount; price=nothing, params=Dict())
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
            request[Symbol(market[Symbol("quoteId")])] = self.parseToNumeric(self.costToPrecision(symbol, stringMul(numberToString(amount), numberToString(price))));
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
), market = market)

end
"""
cancels an open order
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#cancel-order-endpoints

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Indodax, id; symbol=nothing, params=Dict())
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
"""
fetch the fee for a transaction
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-fee-endpoints

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTransactionFee(self::Indodax, code; params=Dict())
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
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency)
)

end
"""
fetch the withdrawal fee for a currency; indodax charges no crypto deposit fees, see https://github.com/ccxt/ccxt/issues/25800
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-fee-endpoints

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFee(self::Indodax, code; params=Dict())
    Base.fetch(self.loadMarkets());
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostWithdrawFee(extend(request, params)));
    data = self.safeDict(response, "return", defaultValue = Dict{Symbol, Any}());
    result = self.depositWithdrawFee(response);
    result[Symbol("withdraw")][Symbol("fee")] = self.safeNumber(data, "withdraw_fee");
    result[Symbol("withdraw")][Symbol("percentage")] = false;
    result[Symbol("deposit")][Symbol("fee")] = 0;
    result[Symbol("deposit")][Symbol("percentage")] = false;
    return self.assignDefaultDepositWithdrawFees(result, currency = currency)

end
"""
fetch history of deposits and withdrawals
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#transaction-history-endpoints

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Indodax; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTransactions(transactions, currency = currency, since = since, limit = limit)

end
"""
make a withdrawal
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-coin-endpoints

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Indodax, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
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
    return self.parseTransaction(response, currency = currency)

end
function parseTransaction(self::Indodax, transaction; currency=nothing)
    status = safeString(transaction, "status");
    timestamp = safeTimestamp2(transaction, "success_time", "submit_time");
    depositId = safeString(transaction, "deposit_id");
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => self.safeCurrencyCode(nothing, currency = currency),
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
    Symbol("currency") => self.safeCurrencyCode(nothing, currency = currency),
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
"""
fetch deposit addresses for multiple currencies and chain types
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#general-information-on-endpoints

# Arguments
- `codes`::array, optional: list of unified currency codes, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddresses(self::Indodax; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetInfo(params));
    data = self.safeDict(response, "return");
    addresses = self.safeDict(data, "address", defaultValue = Dict{Symbol, Any}());
    networks = self.safeDict(data, "network", defaultValue = Dict{Symbol, Any}());
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
            self.checkAddress(address = address);
            network = nothing;
            if functions.ccxtruthy(ccxt_in(marketId, networks))
                networkId = safeString(networks, marketId);
                if functions.ccxtruthy(networkId == nothing)
                    throw(ExchangeError(string(self.id, " fetchDepositAddresses() missing networkId")));
                end
                if functions.ccxtruthy(findfirst(",", networkId) !== nothing)
                    network = [];
                    if functions.ccxtruthy(networkId == nothing)
                        throw(ExchangeError(string(self.id, " fetchDepositAddresses() missing networkId")));
                    end
                    networkIds = split(networkId, ",");
                    j = 0
                    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkIds)))
                        _netIdTmp = self.networkIdToCode(networkId = get(networkIds, j + 1, nothing), currencyCode = code);
                        if functions.ccxtruthy(_netIdTmp != nothing)
                                                        push!(network, uppercase(_netIdTmp));
                        end
                        j += 1
                    end

                else
                    _netIdTmp = self.networkIdToCode(networkId = networkId, currencyCode = code);
                    if functions.ccxtruthy(_netIdTmp != nothing)
                        network = uppercase(_netIdTmp);
                    end
                end
            end
            finalNetwork = network;
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = Dict{Symbol, Any}(
                    Symbol("info") => Dict{Symbol, Any}(),
                    Symbol("currency") => code,
                    Symbol("network") => finalNetwork,
                    Symbol("address") => address,
                    Symbol("tag") => nothing
                );
            end
        end
        i += 1
    end
    return result

end
function sign(self::Indodax, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Indodax, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetApiServerTime(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/server_time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiPairs(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/pairs"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiPriceIncrements(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/price_increments"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiSummaries(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/summaries"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiTickerPair(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/ticker/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiTickerAll(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/ticker_all"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiTradesPair(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/trades/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiDepthPair(self::Indodax, params=Dict(), context=Dict())
    return request(self, "api/depth/{pair}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradingviewHistoryV2(self::Indodax, params=Dict(), context=Dict())
    return request(self, "tradingview/history_v2"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetInfo(self::Indodax, params=Dict(), context=Dict())
    return request(self, "getInfo"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransHistory(self::Indodax, params=Dict(), context=Dict())
    return request(self, "transHistory"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTrade(self::Indodax, params=Dict(), context=Dict())
    return request(self, "trade"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTradeHistory(self::Indodax, params=Dict(), context=Dict())
    return request(self, "tradeHistory"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOpenOrders(self::Indodax, params=Dict(), context=Dict())
    return request(self, "openOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderHistory(self::Indodax, params=Dict(), context=Dict())
    return request(self, "orderHistory"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetOrder(self::Indodax, params=Dict(), context=Dict())
    return request(self, "getOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelOrder(self::Indodax, params=Dict(), context=Dict())
    return request(self, "cancelOrder"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawFee(self::Indodax, params=Dict(), context=Dict())
    return request(self, "withdrawFee"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawCoin(self::Indodax, params=Dict(), context=Dict())
    return request(self, "withdrawCoin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostListDownline(self::Indodax, params=Dict(), context=Dict())
    return request(self, "listDownline"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCheckDownline(self::Indodax, params=Dict(), context=Dict())
    return request(self, "checkDownline"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCreateVoucher(self::Indodax, params=Dict(), context=Dict())
    return request(self, "createVoucher"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Indodax(; kwargs...)
    inst = Indodax(Exchange(), describe, nonce, fetchTime, fetchMarkets, parseBalance, fetchBalance, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, parseOrderStatus, parseOrder, fetchOrder, fetchOpenOrders, fetchClosedOrders, createOrder, cancelOrder, fetchTransactionFee, fetchDepositWithdrawFee, fetchDepositsWithdrawals, withdraw, parseTransaction, parseTransactionStatus, fetchDepositAddresses, sign, handleErrors, publicGetApiServerTime, publicGetApiPairs, publicGetApiPriceIncrements, publicGetApiSummaries, publicGetApiTickerPair, publicGetApiTickerAll, publicGetApiTradesPair, publicGetApiDepthPair, publicGetTradingviewHistoryV2, privatePostGetInfo, privatePostTransHistory, privatePostTrade, privatePostTradeHistory, privatePostOpenOrders, privatePostOrderHistory, privatePostGetOrder, privatePostCancelOrder, privatePostWithdrawFee, privatePostWithdrawCoin, privatePostListDownline, privatePostCheckDownline, privatePostCreateVoucher)
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
function __ccxt_doc_Indodax_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Indodax_fetchTime

function __ccxt_doc_Indodax_fetchMarkets() end
"""
retrieves data on all markets for indodax
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#pairs

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Indodax_fetchMarkets

function __ccxt_doc_Indodax_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#get-info-endpoint

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Indodax_fetchBalance

function __ccxt_doc_Indodax_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#depth

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Indodax_fetchOrderBook

function __ccxt_doc_Indodax_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Indodax_fetchTicker

function __ccxt_doc_Indodax_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker-all

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Indodax_fetchTickers

function __ccxt_doc_Indodax_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Indodax_fetchTrades

function __ccxt_doc_Indodax_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

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
__ccxt_doc_Indodax_fetchOHLCV

function __ccxt_doc_Indodax_fetchOrder() end
"""
fetches information on an order made by the user
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#get-order-endpoints

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Indodax_fetchOrder

function __ccxt_doc_Indodax_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#open-orders-endpoints

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Indodax_fetchOpenOrders

function __ccxt_doc_Indodax_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Indodax_fetchClosedOrders

function __ccxt_doc_Indodax_createOrder() end
"""
create a trade order
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#trade-endpoints

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
__ccxt_doc_Indodax_createOrder

function __ccxt_doc_Indodax_cancelOrder() end
"""
cancels an open order
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#cancel-order-endpoints

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Indodax_cancelOrder

function __ccxt_doc_Indodax_fetchTransactionFee() end
"""
fetch the fee for a transaction
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-fee-endpoints

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Indodax_fetchTransactionFee

function __ccxt_doc_Indodax_fetchDepositWithdrawFee() end
"""
fetch the withdrawal fee for a currency; indodax charges no crypto deposit fees, see https://github.com/ccxt/ccxt/issues/25800
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-fee-endpoints

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Indodax_fetchDepositWithdrawFee

function __ccxt_doc_Indodax_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#transaction-history-endpoints

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Indodax_fetchDepositsWithdrawals

function __ccxt_doc_Indodax_withdraw() end
"""
make a withdrawal
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-coin-endpoints

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Indodax_withdraw

function __ccxt_doc_Indodax_fetchDepositAddresses() end
"""
fetch deposit addresses for multiple currencies and chain types
see: https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#general-information-on-endpoints

# Arguments
- `codes`::array, optional: list of unified currency codes, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Indodax_fetchDepositAddresses
