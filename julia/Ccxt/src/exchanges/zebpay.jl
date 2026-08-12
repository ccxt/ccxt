@kwdef mutable struct Zebpay <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    fetchOrderBook::Function = fetchOrderBook
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchOHLCV::Function = fetchOHLCV
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderTrades::Function = fetchOrderTrades
    parseTrade::Function = parseTrade
    fetchBalance::Function = fetchBalance
    createOrder::Function = createOrder
    orderRequest::Function = orderRequest
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrder::Function = fetchOrder
    parseOrder::Function = parseOrder
    closePosition::Function = closePosition
    fetchLeverages::Function = fetchLeverages
    fetchLeverage::Function = fetchLeverage
    setLeverage::Function = setLeverage
    fetchPositions::Function = fetchPositions
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchSwapMarkets::Function = fetchSwapMarkets
    parseBalance::Function = parseBalance
    parsePosition::Function = parsePosition
    parseLeverage::Function = parseLeverage
    parseTradingFee::Function = parseTradingFee
    parseTicker::Function = parseTicker
    parseMarginModification::Function = parseMarginModification
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicSpotGetV2SystemTime::Function = publicSpotGetV2SystemTime
    publicSpotGetV2SystemStatus::Function = publicSpotGetV2SystemStatus
    publicSpotGetV2MarketOrderbook::Function = publicSpotGetV2MarketOrderbook
    publicSpotGetV2MarketTrades::Function = publicSpotGetV2MarketTrades
    publicSpotGetV2MarketTicker::Function = publicSpotGetV2MarketTicker
    publicSpotGetV2MarketAllTickers::Function = publicSpotGetV2MarketAllTickers
    publicSpotGetV2ExExchangeInfo::Function = publicSpotGetV2ExExchangeInfo
    publicSpotGetV2ExCurrencies::Function = publicSpotGetV2ExCurrencies
    publicSpotGetV2MarketKlines::Function = publicSpotGetV2MarketKlines
    publicSpotGetV2ExTradefees::Function = publicSpotGetV2ExTradefees
    publicSwapGetV1SystemTime::Function = publicSwapGetV1SystemTime
    publicSwapGetV1SystemStatus::Function = publicSwapGetV1SystemStatus
    publicSwapGetV1ExchangeTradefee::Function = publicSwapGetV1ExchangeTradefee
    publicSwapGetV1ExchangeTradefees::Function = publicSwapGetV1ExchangeTradefees
    publicSwapGetV1MarketOrderBook::Function = publicSwapGetV1MarketOrderBook
    publicSwapGetV1MarketTicker24Hr::Function = publicSwapGetV1MarketTicker24Hr
    publicSwapGetV1MarketMarkets::Function = publicSwapGetV1MarketMarkets
    publicSwapGetV1MarketAggTrade::Function = publicSwapGetV1MarketAggTrade
    publicSwapPostV1MarketKlines::Function = publicSwapPostV1MarketKlines
    privateSpotPostV2ExOrders::Function = privateSpotPostV2ExOrders
    privateSpotGetV2ExOrders::Function = privateSpotGetV2ExOrders
    privateSpotGetV2AccountBalance::Function = privateSpotGetV2AccountBalance
    privateSpotGetV2ExTradefee::Function = privateSpotGetV2ExTradefee
    privateSpotGetV2ExOrder::Function = privateSpotGetV2ExOrder
    privateSpotGetV2ExOrderFills::Function = privateSpotGetV2ExOrderFills
    privateSpotDeleteV2ExOrder::Function = privateSpotDeleteV2ExOrder
    privateSpotDeleteV2ExOrders::Function = privateSpotDeleteV2ExOrders
    privateSpotDeleteV2ExOrdersCancelAll::Function = privateSpotDeleteV2ExOrdersCancelAll
    privateSwapGetV1WalletBalance::Function = privateSwapGetV1WalletBalance
    privateSwapGetV1TradeOrder::Function = privateSwapGetV1TradeOrder
    privateSwapGetV1TradeOrderOpenOrders::Function = privateSwapGetV1TradeOrderOpenOrders
    privateSwapGetV1TradeUserLeverages::Function = privateSwapGetV1TradeUserLeverages
    privateSwapGetV1TradeUserLeverage::Function = privateSwapGetV1TradeUserLeverage
    privateSwapGetV1TradePositions::Function = privateSwapGetV1TradePositions
    privateSwapGetV1TradeHistory::Function = privateSwapGetV1TradeHistory
    privateSwapPostV1TradeOrder::Function = privateSwapPostV1TradeOrder
    privateSwapPostV1TradeOrderAddTPSL::Function = privateSwapPostV1TradeOrderAddTPSL
    privateSwapPostV1TradeAddMargin::Function = privateSwapPostV1TradeAddMargin
    privateSwapPostV1TradeReduceMargin::Function = privateSwapPostV1TradeReduceMargin
    privateSwapPostV1TradePositionClose::Function = privateSwapPostV1TradePositionClose
    privateSwapPostV1TradeUpdateUserLeverage::Function = privateSwapPostV1TradeUpdateUserLeverage
    privateSwapDeleteV1TradeOrder::Function = privateSwapDeleteV1TradeOrder

end
function describe(self::Zebpay, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "zebpay",
    Symbol("name") => "Zebpay",
    Symbol("countries") => ["IN"],
    Symbol("rateLimit") => 50,
    Symbol("version") => "v1",
    Symbol("certified") => false,
    Symbol("pro") => false,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => nothing,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("closePosition") => true,
        Symbol("createOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => 1,
        Symbol("5m") => 5,
        Symbol("15m") => 15,
        Symbol("30m") => 30,
        Symbol("1h") => 60,
        Symbol("2h") => 120,
        Symbol("4h") => 480,
        Symbol("12h") => 720,
        Symbol("1d") => 1440,
        Symbol("1w") => 10080
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/0e88d86a-a1cd-49df-a826-054cd8caafa6",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => "https://sapi.zebpay.com",
            Symbol("swap") => "https://futuresbe.zebpay.com"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("spot") => "https://www.zebstage.com",
            Symbol("swap") => "https://dev-futuresbe.zebstage.com"
        ),
        Symbol("www") => "https://www.zebpay.com",
        Symbol("doc") => "https://github.com/zebpay/zebpay-api-references",
        Symbol("fees") => "https://zebpay.com/in/features/pricing"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/system/time") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/system/status") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/market/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/market/allTickers") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/ex/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/ex/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/market/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/ex/tradefees") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                )
            ),
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v1/system/time") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/system/status") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/exchange/tradefee") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/exchange/tradefees") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/market/orderBook") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/market/ticker24Hr") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/market/markets") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/market/aggTrade") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("v1/market/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                )
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("v2/ex/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                ),
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/ex/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/ex/tradefee") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/ex/order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/ex/order/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("v2/ex/order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/ex/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/ex/orders/cancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                )
            ),
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v1/wallet/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/order/open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/userLeverages") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/userLeverage") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("v1/trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/order/addTPSL") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/addMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/reduceMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/position/close") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v1/trade/update/userLeverage") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("v1/trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                )
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("fees") => Dict{Symbol, Any}(),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "swap"]
        ),
        Symbol("defaultType") => "spot"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 100
            )
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("77") => InvalidOrder,
            Symbol("400") => BadRequest,
            Symbol("401") => AuthenticationError,
            Symbol("403") => NotSupported,
            Symbol("404") => NotSupported,
            Symbol("429") => RateLimitExceeded,
            Symbol("500") => ExchangeNotAvailable,
            Symbol("503") => ExchangeNotAvailable,
            Symbol("3013") => OrderNotFound,
            Symbol("Order quantity is out of range") => InvalidOrder,
            Symbol("Invalid trade order type") => InvalidOrder,
            Symbol("Insufficient margin") => InsufficientFunds,
            Symbol("insufficient balance") => InsufficientFunds,
            Symbol("leverage must be in [1,8]") => BadRequest,
            Symbol("the request you sent is invalid") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("InvalidOrder") => InvalidOrder
        )
    )
))

end
"""
the latest known information on the availability of the exchange API
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#system-status
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Zebpay; params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchStatus", market = nothing, params = params);
    isSpot = (type_var == "spot");
    response = nothing;
    data = Dict{Symbol, Any}();
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.publicSpotGetV2SystemStatus(params));
        data = response;
    else
        response = Base.fetch(self.publicSwapGetV1SystemStatus(params));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    end
    status = safeString2(data, "systemStatus", "status");
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
fetches the current integer timestamp in milliseconds from the poloniexfutures server
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-server-time
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the poloniexfutures server
"""
function fetchTime(self::Zebpay; params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTime", market = nothing, params = params);
    isSpot = (type_var == "spot");
    response = nothing;
    data = Dict{Symbol, Any}();
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.publicSpotGetV2SystemTime(params));
        data = response;
    else
        response = Base.fetch(self.publicSwapGetV1SystemTime(params));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    end
    time = safeInteger(data, "timestamp");
    return time

end
"""
retrieves data on all markets for zebpay
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-trading-pairs
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#fetch-markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Zebpay; params=Dict())
    promisesUnresolved = [];
    fetchMarketsOptions = self.safeDict(self.options, "fetchMarkets");
    defaultMarkets = ["spot", "swap"];
    types = self.safeList(fetchMarketsOptions, "types", defaultValue = defaultMarkets);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        type_var = get(types, i + 1, nothing);
        if functions.ccxtruthy(type_var == "spot")
                        push!(promisesUnresolved, self.fetchSpotMarkets(params = params));
        elseif functions.ccxtruthy(type_var == "swap")
            push!(promisesUnresolved, self.fetchSwapMarkets(params = params));
        else
            throw(ExchangeError(string(self.id, " fetchMarkets() this.options fetchMarkets \"", type_var, "\" is not a supported market type")));
        end
        i += 1
    end
    promises = Base.fetch(asyncmap(Base.fetch, promisesUnresolved));
    spotMarkets = self.safeList(promises, 0, defaultValue = []);
    futureMarkets = self.safeList(promises, 1, defaultValue = []);
    return arrayConcat(spotMarkets, futureMarkets)

end
"""
fetches all available currencies on an exchange
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-coin-settings

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Zebpay; params=Dict())
    response = Base.fetch(self.publicSpotGetV2ExCurrencies(params));
    rows = self.safeList(response, "data", defaultValue = []);
    return self.parseCurrencies(rows)

end
function parseCurrency(self::Zebpay, rawCurrency)
    currencyId = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(currencyId);
    name = safeString(rawCurrency, "name");
    precision = self.parseNumber(self.parsePrecision(precision = safeString(rawCurrency, "precision")));
    chains = self.safeList(rawCurrency, "chains", defaultValue = []);
    networks = Dict{Symbol, Any}();
    minWithdrawFeeString = nothing;
    minWithdrawString = nothing;
    minDepositString = nothing;
    deposit = false;
    withdraw = false;
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "chainId");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        depositAllowed = self.safeBool(chain, "isDepositEnabled");
        deposit = functions.ccxtruthy((depositAllowed)) ? depositAllowed : deposit;
        withdrawAllowed = self.safeBool(chain, "isWithdrawEnabled");
        withdraw = functions.ccxtruthy((withdrawAllowed)) ? withdrawAllowed : withdraw;
        withdrawFeeString = safeString(chain, "withdrawalFee");
        if functions.ccxtruthy(withdrawFeeString != nothing)
            minWithdrawFeeString = functions.ccxtruthy((minWithdrawFeeString == nothing)) ? withdrawFeeString : stringMin(withdrawFeeString, minWithdrawFeeString);
        end
        minNetworkWithdrawString = safeString(chain, "withdrawalMinSize");
        if functions.ccxtruthy(minNetworkWithdrawString != nothing)
            minWithdrawString = functions.ccxtruthy((minWithdrawString == nothing)) ? minNetworkWithdrawString : stringMin(minNetworkWithdrawString, minWithdrawString);
        end
        minNetworkDepositString = safeString(chain, "depositMinSize");
        if functions.ccxtruthy(minNetworkDepositString != nothing)
            minDepositString = functions.ccxtruthy((minDepositString == nothing)) ? minNetworkDepositString : stringMin(minNetworkDepositString, minDepositString);
        end
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => chain,
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("active") => @functions.ccxt_and(depositAllowed, withdrawAllowed),
                Symbol("deposit") => depositAllowed,
                Symbol("withdraw") => withdrawAllowed,
                Symbol("fee") => self.parseNumber(withdrawFeeString),
                Symbol("precision") => precision,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.parseNumber(minNetworkWithdrawString),
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.parseNumber(minNetworkDepositString),
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("name") => name,
    Symbol("active") => @functions.ccxt_and(deposit, withdraw),
    Symbol("deposit") => deposit,
    Symbol("withdraw") => withdraw,
    Symbol("fee") => self.parseNumber(minWithdrawFeeString),
    Symbol("precision") => precision,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minWithdrawString),
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minDepositString),
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => networks
))

end
"""
fetch the trading fees for a market
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-exchange-fee
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fee-single-symbol

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::object, optional: side to fetch trading fee

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchTradingFee(self::Zebpay, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = nothing;
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.privateSpotGetV2ExTradefee(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    else
        response = Base.fetch(self.publicSwapGetV1ExchangeTradefee(extend(request, params)));
        responseData = self.safeList(response, "data", defaultValue = []);
        data = self.safeDict(responseData, 0, defaultValue = Dict{Symbol, Any}());
    end
    return self.parseTradingFee(data, market = market)

end
"""
fetch the trading fees for multiple markets
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fees-all-symbols

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchTradingFees(self::Zebpay; params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTradingFees", market = nothing, params = params);
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.publicSpotGetV2ExTradefees(params));
    else
        response = Base.fetch(self.publicSwapGetV1ExchangeTradefees(params));
    end
    fees = self.safeList(response, "data", defaultValue = []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = self.parseTradingFee(get(fees, i + 1, nothing));
        symbol = get(fee, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = fee;
        end
        i += 1
    end
    return result

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-order-book
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Zebpay, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.publicSpotGetV2MarketOrderbook(extend(request, params)));
    else
        response = Base.fetch(self.publicSwapGetV1MarketOrderBook(extend(request, params)));
    end
    bookData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orderbook = self.parseOrderBook(bookData, get(market, Symbol("symbol"), nothing), timestamp = nothing, bidsKey = "bids", asksKey = "asks", priceKey = 0, amountKey = 1);
    orderbook[Symbol("nonce")] = safeInteger(bookData, "nonce");
    return orderbook

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-ticker
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-24hr-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Zebpay, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.publicSpotGetV2MarketTicker(extend(request, params)));
    else
        response = Base.fetch(self.publicSwapGetV1MarketTicker24Hr(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(data, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-all-tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Zebpay; symbols=nothing, params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market = nothing, params = params);
    if functions.ccxtruthy(type_var != "spot")
        throw(NotSupported(string(self.id, " fetchTickers() does not support ", type_var, " markets")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicSpotGetV2MarketAllTickers(params));
    tickerList = self.safeList(response, "data", defaultValue = []);
    return self.parseTickers(tickerList, symbols = symbols)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-klinescandlesticks
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#-get-k-lines-ohlcv-data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.endtime`::int, optional: the latest time in ms to fetch orders for

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Zebpay, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("interval")] = safeString(self.timeframes, timeframe, timeframe);
    else
        request[Symbol("interval")] = timeframe;
    end
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("contract"), nothing), (limit != nothing)))
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            request[Symbol("startTime")] = since;
        else
            request[Symbol("since")] = since;
        end
    end
    until = safeInteger2(params, "until", "endtime");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
        params = omit(params, ["endtime", "until"]);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(@functions.ccxt_or(until == nothing, since == nothing))
            throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a both a since and until/endtime parameter for spot markets")));
        end
        response = Base.fetch(self.publicSpotGetV2MarketKlines(extend(request, params)));
    else
        response = Base.fetch(self.publicSwapPostV1MarketKlines(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
get the list of most recent trades for a particular symbol
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-recent-trades
see: https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-aggregate-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Zebpay, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), limit != nothing))
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.publicSpotGetV2MarketTrades(extend(request, params)));
    else
        response = Base.fetch(self.publicSwapGetV1MarketAggTrade(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
get the list of most recent trades for a particular symbol
see: https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-trade-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchMyTrades(self::Zebpay; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchMyTrades() does not support spot markets")));
    else
        response = Base.fetch(self.privateSwapGetV1TradeHistory(params));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    items = self.safeList(data, "items", defaultValue = []);
    return self.parseTrades(items, market = market, since = since, limit = limit)

end
"""
fetch all the trades made from a single order
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-fills

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Zebpay, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrderTrades", market = nothing, params = params);
    if functions.ccxtruthy(type_var != "spot")
        throw(NotSupported(string(self.id, " fetchOrderTrades() does not support ", type_var, " markets")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    response = Base.fetch(self.privateSpotGetV2ExOrderFills(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    trades = [data];
    return self.parseTrades(trades)

end
function parseTrade(self::Zebpay, trade; market=nothing)
    id = safeString2(trade, "id", "aggregateTradeId");
    orderId = safeString2(trade, "id", "order");
    timestamp = safeInteger2(trade, "timestamp", "tradeTime");
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_");
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeStringLower(trade, "side");
    priceString = safeString(trade, "price");
    amountString = safeString2(trade, "amount", "quantity");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => safeStringLower(trade, "type"),
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => safeString(trade, "cost"),
    Symbol("fee") => self.safeDict(trade, "fee")
), market = market)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-account-balance
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/wallet.md#get-wallet-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Zebpay; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    isSpot = (type_var == "spot");
    response = nothing;
    if functions.ccxtruthy(isSpot)
        response = Base.fetch(self.privateSpotGetV2AccountBalance(params));
    else
        response = Base.fetch(self.privateSwapGetV1WalletBalance(params));
    end
    return self.parseBalance(response)

end
"""
Create an order on the exchange
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#place-new-order
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--create-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.formType`::string, optional: The price at which a trigger order is triggered at
- `params.marginAsset`::string, optional: The asset the order creates, default is INR.
- `params.takeProfit`::bool, optional: Takeprofit flag for the order.
- `params.stopLoss`::bool, optional: Stop loss flag for the order.
- `params.positionId`::string, optional: PositionId of the order.

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Zebpay, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    upperCaseType = uppercase(type_var);
    takeProfitPrice = safeString(params, "takeProfitPrice");
    stopLossPrice = safeString(params, "stopLossPrice");
    params = omit(params, ["marginAsset", "takeProfitPrice", "takeProfitPrice"]);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        (request, params) = self.orderRequest(symbol, type_var, amount, request, price = price, params = params);
        response = Base.fetch(self.privateSpotPostV2ExOrders(extend(request, params)));
    else
        marginAsset = safeString(params, "marginAsset", "INR");
        formType = safeStringUpper(params, "formType", "ORDER_FORM");
        request[Symbol("formType")] = formType;
        request[Symbol("amount")] = self.parseToNumeric(self.amountToPrecision(get(market, Symbol("id"), nothing), amount));
        request[Symbol("marginAsset")] = marginAsset;
        hasTP = takeProfitPrice != nothing;
        hasSL = stopLossPrice != nothing;
        if functions.ccxtruthy(@functions.ccxt_or(hasTP, hasSL))
            if functions.ccxtruthy(hasTP)
                request[Symbol("takeProfitPrice")] = self.parseToNumeric(self.priceToPrecision(symbol, takeProfitPrice));
            end
            if functions.ccxtruthy(hasSL)
                request[Symbol("stopLossPrice")] = self.parseToNumeric(self.priceToPrecision(symbol, stopLossPrice));
            end
            response = Base.fetch(self.privateSwapPostV1TradeOrderAddTPSL(extend(request, params)));
        else
            request[Symbol("type")] = upperCaseType;
            if functions.ccxtruthy(type_var == "limit")
                if functions.ccxtruthy(price == nothing)
                    throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for limit orders")));
                end
                request[Symbol("price")] = self.parseToNumeric(self.priceToPrecision(symbol, price));
            end
            response = Base.fetch(self.privateSwapPostV1TradeOrder(extend(request, params)));
        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function orderRequest(self::Zebpay, symbol, type_var, amount, request; price=nothing, params=Dict())
    upperCaseType = uppercase(type_var);
    triggerPrice = safeString(params, "stopLossPrice");
    quoteOrderQty = safeString2(params, "quoteOrderQty", "cost", nothing);
    timeInForce = safeString(params, "timeInForce", "GTC");
    clientOrderId = safeString(params, "clientOrderId", uuid());
    params = omit(params, ["stopLossPrice", "cost", "timeInForce", "clientOrderId"]);
    request[Symbol("type")] = upperCaseType;
    request[Symbol("clientOrderId")] = clientOrderId;
    request[Symbol("timeInForce")] = timeInForce;
    if functions.ccxtruthy(upperCaseType == "MARKET")
        if functions.ccxtruthy(quoteOrderQty == nothing)
            throw(ExchangeError(string(self.id, " spot market orders require cost in params")));
        end
        request[Symbol("quoteOrderAmount")] = self.costToPrecision(symbol, quoteOrderQty);
    else
        if functions.ccxtruthy(triggerPrice != nothing)
            request[Symbol("stopLossPrice")] = self.priceToPrecision(symbol, triggerPrice);
        end
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    return [request, params]

end
"""
cancels an open order
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-order
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timestamp`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Zebpay, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("orderId")] = id;
        response = Base.fetch(self.privateSpotDeleteV2ExOrder(extend(request, params)));
    else
        clientOrderId = safeString(params, "clientOrderId");
        if functions.ccxtruthy(clientOrderId == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a clientOrderId parameter for swap orders")));
        end
        request[Symbol("clientOrderId")] = clientOrderId;
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privateSwapDeleteV1TradeOrder(extend(request, params)));
    end
    return self.parseOrder(self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}()))

end
"""
cancels all open orders
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-all-orders

# Arguments
- `symbol`::string, optional: unified symbol of the market the orders were made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timestamp`::int, optional: the timestamp of the request in ms

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Zebpay; symbol=nothing, params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrders", market = nothing, params = params);
    if functions.ccxtruthy(type_var != "spot")
        throw(NotSupported(string(self.id, " cancelAllOrders() does not support ", type_var, " markets")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateSpotDeleteV2ExOrdersCancelAll(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    parsedOrder = self.parseOrder(data);
    return [parsedOrder]

end
"""
fetches information on multiple open orders made by the user
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-orders
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Zebpay; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    orders = [];
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("currentPage")] = 1;
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("pageSize")] = limit;
        end
        response = Base.fetch(self.privateSpotGetV2ExOrders(extend(request, params)));
        responseData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        orders = self.safeList(responseData, "items", defaultValue = []);
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("since")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.privateSwapGetV1TradeOrderOpenOrders(extend(request, params)));
        responseData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        orders = self.safeList(responseData, "data", defaultValue = []);
    end
    return self.parseOrders(orders, market = market, since = nothing, limit = limit)

end
"""
fetches information on an order made by the user
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-details
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-order-details

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: cancel order by client order id
- `params.timestamp`::string, optional: cancel order by client order id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Zebpay, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("orderId")] = id;
        response = Base.fetch(self.privateSpotGetV2ExOrder(extend(request, params)));
    else
        request[Symbol("id")] = id;
        response = Base.fetch(self.privateSwapGetV1TradeOrder(extend(request, params)));
    end
    responseData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(responseData, market = market)

end
function parseOrder(self::Zebpay, order; market=nothing)
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    type_var = safeString(order, "type");
    timestamp = self.safeNumber(order, "timestamp");
    datetime = self.iso8601(timestamp);
    price = safeString(order, "price");
    side = safeString(order, "side");
    amount = safeString(order, "amount");
    clientOrderId = safeString(order, "clientOrderId");
    timeInForce = safeString(order, "timeInForce");
    status = safeStringLower(order, "status");
    orderId = safeString(order, "orderId");
    parsedOrder = self.safeOrder(Dict{Symbol, Any}(
        Symbol("id") => orderId,
        Symbol("clientOrderId") => clientOrderId,
        Symbol("symbol") => symbol,
        Symbol("type") => type_var,
        Symbol("timeInForce") => timeInForce,
        Symbol("postOnly") => nothing,
        Symbol("reduceOnly") => nothing,
        Symbol("side") => side,
        Symbol("amount") => amount,
        Symbol("price") => price,
        Symbol("triggerPrice") => nothing,
        Symbol("cost") => nothing,
        Symbol("filled") => nothing,
        Symbol("remaining") => nothing,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => datetime,
        Symbol("fee") => nothing,
        Symbol("status") => status,
        Symbol("info") => order,
        Symbol("lastTradeTimestamp") => nothing,
        Symbol("lastUpdateTimestamp") => nothing,
        Symbol("average") => nothing,
        Symbol("trades") => nothing
    ), market = market);
    return parsedOrder

end
"""
closes open positions for a market
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-close-position

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string: not used by kucoinfutures closePositions
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::string, optional: client order id of the order

# Returns
- [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function closePosition(self::Zebpay, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateSwapPostV1TradePositionClose(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
fetch the set leverage for all contract and margin markets
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-all-user-leverages

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverages(self::Zebpay; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateSwapGetV1TradeUserLeverages(params));
    leveragePreferences = self.safeList(response, "data", defaultValue = []);
    return self.parseLeverages(leveragePreferences, symbols = symbols, symbolKey = "symbol")

end
"""
fetch the set leverage for a market
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#get-user-leverage-single-symbol

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Zebpay, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => safeStringUpper(market, "id")
    );
    response = Base.fetch(self.privateSwapGetV1TradeUserLeverage(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseLeverage(data, market = market)

end
"""
set the level of leverage for a market
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-update-user-leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setLeverage(self::Zebpay, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateSwapPostV1TradeUpdateUserLeverage(extend(request, params)));
    return response

end
"""
Fetches current contract trading positions
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--get-positions

# Arguments
- `symbols`::array: List of unified symbols
- `params`::object, optional: Not used by krakenfutures

# Returns
- Parsed exchange response for positions
"""
function fetchPositions(self::Zebpay; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        request[Symbol("symbols")] = self.marketIds(symbols = symbols);
    end
    response = Base.fetch(self.privateSwapGetV1TradePositions(extend(request, params)));
    positions = self.safeList(response, "data", defaultValue = []);
    result = self.parsePositions(positions);
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
"""
add margin
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-add-margin-to-position

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint.
- `params.positionId`::string, optional: PositionId of the order to add margin.
- `params.timestamp`::string, optional: Tiemstamp.

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Zebpay, symbol, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("amount") => amount
    );
    response = Base.fetch(self.privateSwapPostV1TradeAddMargin(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return extend(self.parseMarginModification(data, market = market), Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("direction") => "in"
))

end
"""
add margin
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-reduce-margin-from-position

# Arguments
- `symbol`::string: unified market symbol.
- `amount`::float: amount of margin to add.
- `params`::object, optional: extra parameters specific to the exchange API endpoint.
- `params.positionId`::string, optional: PositionId of the order to add margin.
- `params.timestamp`::string, optional: Tiemstamp.

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Zebpay, symbol, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("amount") => amount
    );
    response = Base.fetch(self.privateSwapPostV1TradeReduceMargin(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return extend(self.parseMarginModification(data, market = market), Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("direction") => "out"
))

end
function fetchSpotMarkets(self::Zebpay; params=Dict())
    response = Base.fetch(self.publicSpotGetV2ExExchangeInfo(params));
    result = [];
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    markets = self.safeList(data, "symbols", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseAsset");
        quoteId = safeString(market, "quoteAsset");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("swap") => false,
    Symbol("margin") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => nothing,
    Symbol("contract") => nothing,
    Symbol("taker") => self.safeNumber(market, "takerFee"),
    Symbol("maker") => self.safeNumber(market, "makerFee"),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "lotSz"),
        Symbol("price") => self.safeNumber(market, "tickSz")
    ),
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
        )
    ),
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function fetchSwapMarkets(self::Zebpay; params=Dict())
    response = Base.fetch(self.publicSwapGetV1MarketMarkets(params));
    result = [];
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    markets = self.safeList(data, "symbols", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseAsset");
        quoteId = safeString(market, "quoteAsset");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(quoteId);
        status = safeString(market, "status");
        symbol = string(base, "/", quote_var);
        push!(result, self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(symbol, ":", settle),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("type") => "swap",
    Symbol("option") => false,
    Symbol("active") => (status == "Open"),
    Symbol("contract") => true,
    Symbol("taker") => self.safeNumber(market, "takerFee"),
    Symbol("maker") => self.safeNumber(market, "makerFee"),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "lotSz"),
        Symbol("price") => self.safeNumber(market, "tickSz")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minLeverage"),
            Symbol("max") => self.safeNumber(market, "maxLeverage")
        )
    ),
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
function parseBalance(self::Zebpay, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    currencyList = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyList)))
        entry = get(currencyList, i + 1, nothing);
        account = self.account();
        account[Symbol("total")] = safeString(entry, "total");
        account[Symbol("free")] = safeString(entry, "free");
        account[Symbol("used")] = safeString(entry, "used");
        currencyId = safeString(entry, "currency");
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function parsePosition(self::Zebpay, position; market=nothing)
    leverage = self.safeNumber(position, "leverage");
    datetime = safeString(position, "datetime");
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("symbol") => marketId,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("initialMargin") => self.safeNumber(position, "initialMargin"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("entryPrice") => self.safeNumber(position, "entryPrice"),
    Symbol("notional") => self.safeNumber(position, "notional"),
    Symbol("leverage") => leverage,
    Symbol("unrealizedPnl") => nothing,
    Symbol("contracts") => self.safeNumber(position, "contracts"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidationPrice"),
    Symbol("markPrice") => nothing,
    Symbol("collateral") => nothing,
    Symbol("marginType") => "isolated",
    Symbol("side") => safeString(position, "side"),
    Symbol("percentage") => nothing
)

end
function parseLeverage(self::Zebpay, leverage; market=nothing)
    marketId = safeString(leverage, "symbol");
    info = self.safeDict(leverage, "info");
    leverageValue = safeInteger(leverage, "longLeverage");
    leverageValueShort = safeInteger(leverage, "shortLeverage");
    marginMode = safeString(leverage, "marginMode");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => marketId,
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValueShort
)

end
function parseTradingFee(self::Zebpay, fee; market=nothing)
    marketId = safeString(fee, "symbol");
    symbol = self.safeSymbol(marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber2(fee, "makerFeeRate", "makerFee"),
    Symbol("taker") => self.safeNumber2(fee, "takerFeeRate", "takerFee"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function parseTicker(self::Zebpay, ticker; market=nothing)
    timestamp = safeInteger2(ticker, "timestamp", "ts");
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId = marketId);
    close = safeString(ticker, "close");
    last_var = safeString(ticker, "last");
    percentage = safeString(ticker, "percentage");
    bidVolume = safeString(ticker, "bidVolume");
    askVolume = safeString(ticker, "askVolume");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => bidVolume,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => askVolume,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => close,
    Symbol("last") => last_var,
    Symbol("previousClose") => safeString(ticker, "previousClose"),
    Symbol("change") => safeString(ticker, "change"),
    Symbol("percentage") => percentage,
    Symbol("average") => safeString(ticker, "average"),
    Symbol("baseVolume") => safeString(ticker, "baseVolume"),
    Symbol("quoteVolume") => safeString(ticker, "quoteVolume"),
    Symbol("markPrice") => nothing,
    Symbol("info") => ticker
), market = market)

end
function parseMarginModification(self::Zebpay, info; market=nothing)
    timestamp = milliseconds();
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => safeString(market, "id"),
    Symbol("type") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("amount") => self.safeNumber(info, "amount"),
    Symbol("total") => nothing,
    Symbol("code") => safeString(info, "code"),
    Symbol("status") => safeString(info, "status"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function sign(self::Zebpay, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    params = omit(params, "defaultType");
    isV1 = findfirst("v1/", path) !== nothing;
    marketType = functions.ccxtruthy(isV1) ? "swap" : "spot";
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(marketType), nothing);
    tail = string("/api/", self.implodeParams(path, params));
    url += tail;
    timestamp = string(milliseconds());
    signature = "";
    query = omit(params, self.extractParams(path));
    queryLength = length(objectKeys(query));
    access = safeString(api, 0, "public");
    if functions.ccxtruthy(access == "public")
        if functions.ccxtruthy(@functions.ccxt_or(method == "GET", method == "DELETE"))
            if functions.ccxtruthy(queryLength)
                url += string("?", self.urlencode(query));
            end
        else
            body = functions.json(params);
            headers = Dict{Symbol, Any}(
                Symbol("Referrer") => "ccxt",
                Symbol("Content-Type") => "application/json"
            );
        end
    else
        self.checkRequiredCredentials();
        isSpot = marketType == "spot";
        params[Symbol("timestamp")] = timestamp;
        if functions.ccxtruthy(@functions.ccxt_or(method == "GET", (@functions.ccxt_and(method == "DELETE", isSpot))))
            queryString = self.urlencode(params);
            signature = self.hmac(self.encode(queryString), self.encode(self.secret), sha256, "hex");
            url += string("?", queryString);
        else
            body = json(params);
            signature = self.hmac(self.encode(body), self.encode(self.secret), sha256, "hex");
        end
        headers = Dict{Symbol, Any}(
            Symbol("Referrer") => "ccxt",
            Symbol("X-AUTH-APIKEY") => self.apiKey,
            Symbol("X-AUTH-SIGNATURE") => signature
        );
        headers[Symbol("Content-Type")] = "application/json";
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Zebpay, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, body);
            return nothing
    end
    errorCode = safeString2(response, "code", "statusCode");
    message = safeString2(response, "msg", "statusDescription");
    feedback = string(self.id, " ", message);
    self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Zebpay, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicSpotGetV2SystemTime(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/system/time"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SystemStatus(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/system/status"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2MarketOrderbook(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/market/orderbook"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2MarketTrades(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/market/trades"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2MarketTicker(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/market/ticker"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2MarketAllTickers(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/market/allTickers"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2ExExchangeInfo(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/exchangeInfo"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2ExCurrencies(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/currencies"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2MarketKlines(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/market/klines"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2ExTradefees(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/tradefees"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetV1SystemTime(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/system/time"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetV1SystemStatus(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/system/status"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetV1ExchangeTradefee(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/exchange/tradefee"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetV1ExchangeTradefees(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/exchange/tradefees"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetV1MarketOrderBook(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/market/orderBook"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetV1MarketTicker24Hr(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/market/ticker24Hr"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetV1MarketMarkets(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/market/markets"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapGetV1MarketAggTrade(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/market/aggTrade"; api=["public", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSwapPostV1MarketKlines(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/market/klines"; api=["public", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2ExOrders(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/orders"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2ExOrders(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/orders"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2AccountBalance(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/account/balance"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2ExTradefee(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/tradefee"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2ExOrder(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2ExOrderFills(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/order/fills"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotDeleteV2ExOrder(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/order"; api=["private", "spot"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotDeleteV2ExOrders(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/orders"; api=["private", "spot"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotDeleteV2ExOrdersCancelAll(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v2/ex/orders/cancelAll"; api=["private", "spot"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetV1WalletBalance(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/wallet/balance"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetV1TradeOrder(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/order"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetV1TradeOrderOpenOrders(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/order/open-orders"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetV1TradeUserLeverages(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/userLeverages"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetV1TradeUserLeverage(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/userLeverage"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetV1TradePositions(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/positions"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapGetV1TradeHistory(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/history"; api=["private", "swap"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostV1TradeOrder(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/order"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostV1TradeOrderAddTPSL(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/order/addTPSL"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostV1TradeAddMargin(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/addMargin"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostV1TradeReduceMargin(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/reduceMargin"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostV1TradePositionClose(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/position/close"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapPostV1TradeUpdateUserLeverage(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/update/userLeverage"; api=["private", "swap"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSwapDeleteV1TradeOrder(self::Zebpay, params=Dict(), context=Dict())
    return request(self, "v1/trade/order"; api=["private", "swap"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Zebpay(; kwargs...)
    inst = Zebpay(Exchange(), describe, fetchStatus, fetchTime, fetchMarkets, fetchCurrencies, parseCurrency, fetchTradingFee, fetchTradingFees, fetchOrderBook, fetchTicker, fetchTickers, fetchOHLCV, fetchTrades, fetchMyTrades, fetchOrderTrades, parseTrade, fetchBalance, createOrder, orderRequest, cancelOrder, cancelAllOrders, fetchOpenOrders, fetchOrder, parseOrder, closePosition, fetchLeverages, fetchLeverage, setLeverage, fetchPositions, addMargin, reduceMargin, fetchSpotMarkets, fetchSwapMarkets, parseBalance, parsePosition, parseLeverage, parseTradingFee, parseTicker, parseMarginModification, sign, handleErrors, publicSpotGetV2SystemTime, publicSpotGetV2SystemStatus, publicSpotGetV2MarketOrderbook, publicSpotGetV2MarketTrades, publicSpotGetV2MarketTicker, publicSpotGetV2MarketAllTickers, publicSpotGetV2ExExchangeInfo, publicSpotGetV2ExCurrencies, publicSpotGetV2MarketKlines, publicSpotGetV2ExTradefees, publicSwapGetV1SystemTime, publicSwapGetV1SystemStatus, publicSwapGetV1ExchangeTradefee, publicSwapGetV1ExchangeTradefees, publicSwapGetV1MarketOrderBook, publicSwapGetV1MarketTicker24Hr, publicSwapGetV1MarketMarkets, publicSwapGetV1MarketAggTrade, publicSwapPostV1MarketKlines, privateSpotPostV2ExOrders, privateSpotGetV2ExOrders, privateSpotGetV2AccountBalance, privateSpotGetV2ExTradefee, privateSpotGetV2ExOrder, privateSpotGetV2ExOrderFills, privateSpotDeleteV2ExOrder, privateSpotDeleteV2ExOrders, privateSpotDeleteV2ExOrdersCancelAll, privateSwapGetV1WalletBalance, privateSwapGetV1TradeOrder, privateSwapGetV1TradeOrderOpenOrders, privateSwapGetV1TradeUserLeverages, privateSwapGetV1TradeUserLeverage, privateSwapGetV1TradePositions, privateSwapGetV1TradeHistory, privateSwapPostV1TradeOrder, privateSwapPostV1TradeOrderAddTPSL, privateSwapPostV1TradeAddMargin, privateSwapPostV1TradeReduceMargin, privateSwapPostV1TradePositionClose, privateSwapPostV1TradeUpdateUserLeverage, privateSwapDeleteV1TradeOrder)
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
function __ccxt_doc_Zebpay_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#system-status
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Zebpay_fetchStatus

function __ccxt_doc_Zebpay_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the poloniexfutures server
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-server-time
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the poloniexfutures server
"""
__ccxt_doc_Zebpay_fetchTime

function __ccxt_doc_Zebpay_fetchMarkets() end
"""
retrieves data on all markets for zebpay
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-trading-pairs
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#fetch-markets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Zebpay_fetchMarkets

function __ccxt_doc_Zebpay_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-coin-settings

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Zebpay_fetchCurrencies

function __ccxt_doc_Zebpay_fetchTradingFee() end
"""
fetch the trading fees for a market
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-exchange-fee
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fee-single-symbol

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::object, optional: side to fetch trading fee

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Zebpay_fetchTradingFee

function __ccxt_doc_Zebpay_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fees-all-symbols

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Zebpay_fetchTradingFees

function __ccxt_doc_Zebpay_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-order-book
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Zebpay_fetchOrderBook

function __ccxt_doc_Zebpay_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-ticker
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-24hr-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Zebpay_fetchTicker

function __ccxt_doc_Zebpay_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-all-tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Zebpay_fetchTickers

function __ccxt_doc_Zebpay_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-klinescandlesticks
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#-get-k-lines-ohlcv-data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.endtime`::int, optional: the latest time in ms to fetch orders for

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Zebpay_fetchOHLCV

function __ccxt_doc_Zebpay_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-recent-trades
see: https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-aggregate-trades

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Zebpay_fetchTrades

function __ccxt_doc_Zebpay_fetchMyTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-trade-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Zebpay_fetchMyTrades

function __ccxt_doc_Zebpay_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-fills

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Zebpay_fetchOrderTrades

function __ccxt_doc_Zebpay_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-account-balance
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/wallet.md#get-wallet-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Zebpay_fetchBalance

function __ccxt_doc_Zebpay_createOrder() end
"""
Create an order on the exchange
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#place-new-order
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--create-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.formType`::string, optional: The price at which a trigger order is triggered at
- `params.marginAsset`::string, optional: The asset the order creates, default is INR.
- `params.takeProfit`::bool, optional: Takeprofit flag for the order.
- `params.stopLoss`::bool, optional: Stop loss flag for the order.
- `params.positionId`::string, optional: PositionId of the order.

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Zebpay_createOrder

function __ccxt_doc_Zebpay_cancelOrder() end
"""
cancels an open order
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-order
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timestamp`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Zebpay_cancelOrder

function __ccxt_doc_Zebpay_cancelAllOrders() end
"""
cancels all open orders
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-all-orders

# Arguments
- `symbol`::string, optional: unified symbol of the market the orders were made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timestamp`::int, optional: the timestamp of the request in ms

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Zebpay_cancelAllOrders

function __ccxt_doc_Zebpay_fetchOpenOrders() end
"""
fetches information on multiple open orders made by the user
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-orders
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Zebpay_fetchOpenOrders

function __ccxt_doc_Zebpay_fetchOrder() end
"""
fetches information on an order made by the user
see: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-details
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-order-details

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: cancel order by client order id
- `params.timestamp`::string, optional: cancel order by client order id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Zebpay_fetchOrder

function __ccxt_doc_Zebpay_closePosition() end
"""
closes open positions for a market
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-close-position

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string: not used by kucoinfutures closePositions
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::string, optional: client order id of the order

# Returns
- [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Zebpay_closePosition

function __ccxt_doc_Zebpay_fetchLeverages() end
"""
fetch the set leverage for all contract and margin markets
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-all-user-leverages

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Zebpay_fetchLeverages

function __ccxt_doc_Zebpay_fetchLeverage() end
"""
fetch the set leverage for a market
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#get-user-leverage-single-symbol

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Zebpay_fetchLeverage

function __ccxt_doc_Zebpay_setLeverage() end
"""
set the level of leverage for a market
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-update-user-leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Zebpay_setLeverage

function __ccxt_doc_Zebpay_fetchPositions() end
"""
Fetches current contract trading positions
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--get-positions

# Arguments
- `symbols`::array: List of unified symbols
- `params`::object, optional: Not used by krakenfutures

# Returns
- Parsed exchange response for positions
"""
__ccxt_doc_Zebpay_fetchPositions

function __ccxt_doc_Zebpay_addMargin() end
"""
add margin
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-add-margin-to-position

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint.
- `params.positionId`::string, optional: PositionId of the order to add margin.
- `params.timestamp`::string, optional: Tiemstamp.

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Zebpay_addMargin

function __ccxt_doc_Zebpay_reduceMargin() end
"""
add margin
see: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-reduce-margin-from-position

# Arguments
- `symbol`::string: unified market symbol.
- `amount`::float: amount of margin to add.
- `params`::object, optional: extra parameters specific to the exchange API endpoint.
- `params.positionId`::string, optional: PositionId of the order to add margin.
- `params.timestamp`::string, optional: Tiemstamp.

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Zebpay_reduceMargin
