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
        Symbol("fetchDepositWithdrawFees") => true,
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
                Symbol("health") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("constants") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("kit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbooks") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("chart") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("charts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("minicharts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("oracle/prices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quick-trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("udf/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("udf/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("udf/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("user") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/withdrawal/fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("user/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
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
"""
retrieves data on all markets for hollaex
see: https://apidocs.hollaex.com/#constants

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Hollaex; params=Dict())
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
"""
fetches all available currencies on an exchange
see: https://apidocs.hollaex.com/#constants

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Hollaex; params=Dict())
    response = Base.fetch(self.publicGetConstants(params));
    coins = self.safeDict(response, "coins", defaultValue = Dict{Symbol, Any}());
    values_var = objectValues(coins);
    return self.parseCurrencies(values_var)

end
function parseCurrency(self::Hollaex, rawCurrency)
    id = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(id);
    withdrawalLimits = self.safeList(rawCurrency, "withdrawal_limits", defaultValue = []);
    rawType = safeString(rawCurrency, "type");
    type_var = functions.ccxtruthy((rawType == "blockchain")) ? "crypto" : "other";
    rawNetworks = self.safeDict(rawCurrency, "withdrawal_fees", defaultValue = Dict{Symbol, Any}());
    networks = Dict{Symbol, Any}();
    networkIds = objectKeys(rawNetworks);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkIds)))
        networkId = get(networkIds, j + 1, nothing);
        networkEntry = self.safeDict(rawNetworks, networkId);
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
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
        end
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
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
see: https://apidocs.hollaex.com/#orderbooks

# Arguments
- `symbols`::any: not used by fetchOrderBooks ()
- `limit`::int, optional: not used by fetchOrderBooks ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbol
"""
function fetchOrderBooks(self::Hollaex; symbols=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetOrderbooks(params));
    result = Dict{Symbol, Any}();
    marketIds = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
        marketId = get(marketIds, i + 1, nothing);
        orderbook = self.safeDict(response, marketId, defaultValue = Dict{Symbol, Any}());
        symbol = self.safeSymbol(marketId, market = nothing, delimiter = "-");
        timestamp = self.parse8601(safeString(orderbook, "timestamp"));
        result[Symbol(symbol)] = self.parseOrderBook(orderbook, symbol, timestamp = timestamp);
        i += 1
    end
    return result

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://apidocs.hollaex.com/#orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Hollaex, symbol; limit=nothing, params=Dict())
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
    return self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp = timestamp)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://apidocs.hollaex.com/#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Hollaex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTicker(extend(request, params)));
    return self.parseTicker(response, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://apidocs.hollaex.com/#tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Hollaex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetTickers(params));
    return self.parseTickers(response, symbols = symbols)

end
function parseTickers(self::Hollaex, tickers; symbols=nothing, params=Dict())
    result = Dict{Symbol, Any}();
    keys_var = objectKeys(tickers);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        ticker = get(tickers, Symbol(key), nothing);
        marketId = safeString(ticker, "symbol", key);
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = "-");
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = extend(self.parseTicker(ticker, market = market), params);
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
function parseTicker(self::Hollaex, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
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
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://apidocs.hollaex.com/#trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Hollaex, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetTrades(extend(request, params)));
    trades = self.safeList(response, get(market, Symbol("id"), nothing), defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTrade(self::Hollaex, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
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
), market = market)

end
"""
fetch the trading fees for multiple markets
see: https://apidocs.hollaex.com/#tiers

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Hollaex; params=Dict())
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
"""
hollaex has large gaps between candles, so it's recommended to specify since
see: https://apidocs.hollaex.com/#chart

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch (max 500)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Hollaex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = paginate);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit))
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
    return self.parseOHLCVs(toArray(response), market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Hollaex, ohlcv; market=nothing)
    return [self.parse8601(safeString(ohlcv, "time")), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
function parseBalance(self::Hollaex, response)
    timestamp = self.parse8601(safeString(response, "updated_at"));
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    currenciesById = self.currencies_by_id;
    if functions.ccxtruthy(currenciesById == nothing)
        throw(ExchangeError(string(self.id, " currencies not loaded")));
    end
    currencyIds = objectKeys(currenciesById);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(response, string(currencyId, "_available"));
        account[Symbol("total")] = safeString(response, string(currencyId, "_balance"));
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://apidocs.hollaex.com/#get-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Hollaex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetUserBalance(params));
    return self.parseBalance(response)

end
"""
fetch an open order by it's id
see: https://apidocs.hollaex.com/#get-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by fetchOpenOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrder(self::Hollaex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateGetOrder(extend(request, params)));
    return self.parseOrder(response)

end
"""
fetch all unfilled currently open orders
see: https://apidocs.hollaex.com/#get-all-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Hollaex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("open") => true
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on multiple closed orders made by the user
see: https://apidocs.hollaex.com/#get-all-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Hollaex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("open") => false
    );
    return Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on an order made by the user
see: https://apidocs.hollaex.com/#get-order

# Arguments
- `id`::string:
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Hollaex, id; symbol=nothing, params=Dict())
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
"""
fetches information on multiple orders made by the user
see: https://apidocs.hollaex.com/#get-all-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Hollaex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

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
function parseOrder(self::Hollaex, order; market=nothing)
    marketId = safeString(order, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "-");
    id = safeString(order, "id");
    timestamp = self.parse8601(safeString(order, "created_at"));
    type_var = safeString(order, "type");
    side = safeString(order, "side");
    price = safeString(order, "price");
    amount = safeString(order, "size");
    filled = safeString(order, "filled");
    status = self.parseOrderStatus(safeString(order, "status"));
    meta = safeValue(order, "meta", Dict{Symbol, Any}());
    postOnly = self.safeBool(meta, "post_only", defaultValue = false);
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
), market = market)

end
"""
create a trade order
see: https://apidocs.hollaex.com/#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Hollaex, symbol, type_var, side, amount; price=nothing, params=Dict())
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
    exchangeSpecificParam = self.safeBool(meta, "post_only", defaultValue = false);
    isMarketOrder = type_var == "market";
    postOnly = self.isPostOnly(isMarketOrder, exchangeSpecificParam, params = params);
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
    return self.parseOrder(response, market = market)

end
"""
cancels an open order
see: https://apidocs.hollaex.com/#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Hollaex, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privateDeleteOrder(extend(request, params)));
    return self.parseOrder(response)

end
"""
cancel all open orders in a market
see: https://apidocs.hollaex.com/#cancel-all-orders

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Hollaex; symbol=nothing, params=Dict())
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
    return self.parseOrders(response, market = market)

end
"""
fetch all trades made by the user
see: https://apidocs.hollaex.com/#get-trades

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Hollaex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
function parseDepositAddress(self::Hollaex, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    tag = nothing;
    if functions.ccxtruthy(address != nothing)
        parts = split(address, ":");
        address = safeString(parts, 0);
        tag = safeString(parts, 1);
    end
    self.checkAddress(address = address);
    currencyId = safeString(depositAddress, "currency");
    currency = self.safeCurrency(currencyId, currency = currency);
    network = safeString(depositAddress, "network");
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("network") => network,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
fetch deposit addresses for multiple currencies and chain types
see: https://apidocs.hollaex.com/#get-user

# Arguments
- `codes`::any: list of unified currency codes, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddresses(self::Hollaex; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    network = safeString(params, "network");
    params = omit(params, "network");
    response = Base.fetch(self.privateGetUser(params));
    wallet = safeValue(response, "wallet", []);
    addresses = functions.ccxtruthy((network == nothing)) ? wallet : filterBy(wallet, "network", network);
    return self.parseDepositAddresses(addresses, codes = codes)

end
"""
fetch all deposits made to an account
see: https://apidocs.hollaex.com/#get-deposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Hollaex; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://apidocs.hollaex.com/#get-withdrawals

# Arguments
- `id`::string: withdrawal id
- `code`::string: unified currency code of the currency withdrawn, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawal(self::Hollaex, id; code=nothing, params=Dict())
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
    transaction = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(transaction, currency = currency)

end
"""
fetch all withdrawals made from an account
see: https://apidocs.hollaex.com/#get-withdrawals

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Hollaex; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Hollaex, transaction; currency=nothing)
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
    currency = self.safeCurrency(currencyId, currency = currency);
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
    feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId, currency = currency);
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
"""
make a withdrawal
see: https://apidocs.hollaex.com/#withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Hollaex, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
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
        Symbol("network") => self.networkCodeToId(network, currencyCode = code)
    );
    response = Base.fetch(self.privatePostUserWithdrawal(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function parseDepositWithdrawFee(self::Hollaex, fee; currency=nothing)
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
            networkCode = self.networkIdToCode(networkId = key, currencyCode = currencyCode);
            if functions.ccxtruthy(networkCode == nothing)
                throw(ArgumentsRequired(string(self.id, " requires a networkCode argument")));
            end
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
"""
fetch deposit and withdraw fees
see: https://apidocs.hollaex.com/#constants

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Hollaex; codes=nothing, params=Dict())
    response = Base.fetch(self.publicGetConstants(params));
    coins = self.safeDict(response, "coins", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositWithdrawFees(coins, codes = codes, currencyIdKey = "symbol")

end
function sign(self::Hollaex, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Hollaex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetHealth(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "health"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetConstants(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "constants"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetKit(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "kit"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTiers(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "tiers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickers(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbook(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderbooks(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "orderbooks"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTrades(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetChart(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "chart"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCharts(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "charts"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMinicharts(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "minicharts"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOraclePrices(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "oracle/prices"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuickTrade(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "quick-trade"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUdfConfig(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "udf/config"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUdfHistory(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "udf/history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUdfSymbols(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "udf/symbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUser(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserBalance(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserDeposits(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/deposits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserWithdrawals(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/withdrawals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserWithdrawalFee(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/withdrawal/fee"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserTrades(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrders(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrder(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserWithdrawal(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "user/withdrawal"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrder(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrderAll(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "order/all"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrder(self::Hollaex, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Hollaex(; kwargs...)
    inst = Hollaex(Exchange(), describe, fetchMarkets, fetchCurrencies, parseCurrency, fetchOrderBooks, fetchOrderBook, fetchTicker, fetchTickers, parseTickers, parseTicker, fetchTrades, parseTrade, fetchTradingFees, fetchOHLCV, parseOHLCV, parseBalance, fetchBalance, fetchOpenOrder, fetchOpenOrders, fetchClosedOrders, fetchOrder, fetchOrders, parseOrderStatus, parseOrder, createOrder, cancelOrder, cancelAllOrders, fetchMyTrades, parseDepositAddress, fetchDepositAddresses, fetchDeposits, fetchWithdrawal, fetchWithdrawals, parseTransaction, withdraw, parseDepositWithdrawFee, fetchDepositWithdrawFees, sign, handleErrors, publicGetHealth, publicGetConstants, publicGetKit, publicGetTiers, publicGetTicker, publicGetTickers, publicGetOrderbook, publicGetOrderbooks, publicGetTrades, publicGetChart, publicGetCharts, publicGetMinicharts, publicGetOraclePrices, publicGetQuickTrade, publicGetUdfConfig, publicGetUdfHistory, publicGetUdfSymbols, privateGetUser, privateGetUserBalance, privateGetUserDeposits, privateGetUserWithdrawals, privateGetUserWithdrawalFee, privateGetUserTrades, privateGetOrders, privateGetOrder, privatePostUserWithdrawal, privatePostOrder, privateDeleteOrderAll, privateDeleteOrder)
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
function __ccxt_doc_Hollaex_fetchMarkets() end
"""
retrieves data on all markets for hollaex
see: https://apidocs.hollaex.com/#constants

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Hollaex_fetchMarkets

function __ccxt_doc_Hollaex_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://apidocs.hollaex.com/#constants

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Hollaex_fetchCurrencies

function __ccxt_doc_Hollaex_fetchOrderBooks() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
see: https://apidocs.hollaex.com/#orderbooks

# Arguments
- `symbols`::any: not used by fetchOrderBooks ()
- `limit`::int, optional: not used by fetchOrderBooks ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbol
"""
__ccxt_doc_Hollaex_fetchOrderBooks

function __ccxt_doc_Hollaex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://apidocs.hollaex.com/#orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Hollaex_fetchOrderBook

function __ccxt_doc_Hollaex_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://apidocs.hollaex.com/#ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Hollaex_fetchTicker

function __ccxt_doc_Hollaex_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://apidocs.hollaex.com/#tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Hollaex_fetchTickers

function __ccxt_doc_Hollaex_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://apidocs.hollaex.com/#trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Hollaex_fetchTrades

function __ccxt_doc_Hollaex_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://apidocs.hollaex.com/#tiers

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Hollaex_fetchTradingFees

function __ccxt_doc_Hollaex_fetchOHLCV() end
"""
hollaex has large gaps between candles, so it's recommended to specify since
see: https://apidocs.hollaex.com/#chart

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch (max 500)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Hollaex_fetchOHLCV

function __ccxt_doc_Hollaex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://apidocs.hollaex.com/#get-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Hollaex_fetchBalance

function __ccxt_doc_Hollaex_fetchOpenOrder() end
"""
fetch an open order by it's id
see: https://apidocs.hollaex.com/#get-order

# Arguments
- `id`::string: order id
- `symbol`::string: not used by fetchOpenOrder ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hollaex_fetchOpenOrder

function __ccxt_doc_Hollaex_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://apidocs.hollaex.com/#get-all-orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hollaex_fetchOpenOrders

function __ccxt_doc_Hollaex_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://apidocs.hollaex.com/#get-all-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hollaex_fetchClosedOrders

function __ccxt_doc_Hollaex_fetchOrder() end
"""
fetches information on an order made by the user
see: https://apidocs.hollaex.com/#get-order

# Arguments
- `id`::string:
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hollaex_fetchOrder

function __ccxt_doc_Hollaex_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://apidocs.hollaex.com/#get-all-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hollaex_fetchOrders

function __ccxt_doc_Hollaex_createOrder() end
"""
create a trade order
see: https://apidocs.hollaex.com/#create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price at which a trigger order is triggered at
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hollaex_createOrder

function __ccxt_doc_Hollaex_cancelOrder() end
"""
cancels an open order
see: https://apidocs.hollaex.com/#cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hollaex_cancelOrder

function __ccxt_doc_Hollaex_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://apidocs.hollaex.com/#cancel-all-orders

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hollaex_cancelAllOrders

function __ccxt_doc_Hollaex_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://apidocs.hollaex.com/#get-trades

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Hollaex_fetchMyTrades

function __ccxt_doc_Hollaex_fetchDepositAddresses() end
"""
fetch deposit addresses for multiple currencies and chain types
see: https://apidocs.hollaex.com/#get-user

# Arguments
- `codes`::any: list of unified currency codes, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Hollaex_fetchDepositAddresses

function __ccxt_doc_Hollaex_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://apidocs.hollaex.com/#get-deposits

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hollaex_fetchDeposits

function __ccxt_doc_Hollaex_fetchWithdrawal() end
"""
fetch data on a currency withdrawal via the withdrawal id
see: https://apidocs.hollaex.com/#get-withdrawals

# Arguments
- `id`::string: withdrawal id
- `code`::string: unified currency code of the currency withdrawn, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hollaex_fetchWithdrawal

function __ccxt_doc_Hollaex_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://apidocs.hollaex.com/#get-withdrawals

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hollaex_fetchWithdrawals

function __ccxt_doc_Hollaex_withdraw() end
"""
make a withdrawal
see: https://apidocs.hollaex.com/#withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hollaex_withdraw

function __ccxt_doc_Hollaex_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://apidocs.hollaex.com/#constants

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Hollaex_fetchDepositWithdrawFees
