@kwdef mutable struct Nado <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    createOrder::Function = createOrder
    createOrderRequest::Function = createOrderRequest
    editOrder::Function = editOrder
    editOrderRequest::Function = editOrderRequest
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersRequest::Function = cancelAllOrdersRequest
    cancelOrders::Function = cancelOrders
    cancelOrdersRequest::Function = cancelOrdersRequest
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    fetchMyTrades::Function = fetchMyTrades
    fetchBalance::Function = fetchBalance
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    queryTransactionsByEventType::Function = queryTransactionsByEventType
    fetchPositions::Function = fetchPositions
    fetchTime::Function = fetchTime
    fetchStatus::Function = fetchStatus
    fetchMarkets::Function = fetchMarkets
    fetchCurrencies::Function = fetchCurrencies
    fetchTickers::Function = fetchTickers
    fetchTicker::Function = fetchTicker
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingHistory::Function = fetchFundingHistory
    fetchFundingRates::Function = fetchFundingRates
    fetchOpenInterest::Function = fetchOpenInterest
    fetchOpenInterests::Function = fetchOpenInterests
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    parseTrade::Function = parseTrade
    parseFundingRate::Function = parseFundingRate
    parseFundingHistory::Function = parseFundingHistory
    parseOpenInterest::Function = parseOpenInterest
    parseTicker::Function = parseTicker
    parseCurrency::Function = parseCurrency
    parseBalance::Function = parseBalance
    parseTransaction::Function = parseTransaction
    parsePosition::Function = parsePosition
    isArchiveOrderClosed::Function = isArchiveOrderClosed
    parseOrder::Function = parseOrder
    parseOrderTimeInForce::Function = parseOrderTimeInForce
    convertToX18::Function = convertToX18
    parseX18::Function = parseX18
    createOrderNonce::Function = createOrderNonce
    createOrderAppendix::Function = createOrderAppendix
    createSubaccount::Function = createSubaccount
    queryContracts::Function = queryContracts
    orderVerifyingContract::Function = orderVerifyingContract
    padHex::Function = padHex
    signOrder::Function = signOrder
    signCancellation::Function = signCancellation
    signCancellationProducts::Function = signCancellationProducts
    signFetchTriggerOrders::Function = signFetchTriggerOrders
    signHash::Function = signHash
    removeMarketSuffix::Function = removeMarketSuffix
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    gatewayPublicGetSymbols::Function = gatewayPublicGetSymbols
    gatewayPublicGetQuery::Function = gatewayPublicGetQuery
    gatewayPublicGetEdgeQuery::Function = gatewayPublicGetEdgeQuery
    gatewayPublicPostQuery::Function = gatewayPublicPostQuery
    gatewayPrivatePostExecute::Function = gatewayPrivatePostExecute
    gatewayV2PublicGetAssets::Function = gatewayV2PublicGetAssets
    gatewayV2PublicGetPairs::Function = gatewayV2PublicGetPairs
    gatewayV2PublicGetOrderbook::Function = gatewayV2PublicGetOrderbook
    archivePost::Function = archivePost
    archiveV2PublicGetTickers::Function = archiveV2PublicGetTickers
    archiveV2PublicGetContracts::Function = archiveV2PublicGetContracts
    archiveV2PublicGetTrades::Function = archiveV2PublicGetTrades
    triggerPrivatePostExecute::Function = triggerPrivatePostExecute
    triggerPrivatePostQuery::Function = triggerPrivatePostQuery

end
function describe(self::Nado, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "nado",
    Symbol("name") => "Nado",
    Symbol("countries") => ["KY"],
    Symbol("rateLimit") => 25,
    Symbol("version") => "v1",
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("dex") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("withdraw") => false
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/811f4e1a-a8b5-4b9e-84c2-0f88997bd274",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("gateway") => "https://gateway.prod.nado.xyz/v1",
            Symbol("gatewayV2") => "https://gateway.prod.nado.xyz/v2",
            Symbol("archive") => "https://archive.prod.nado.xyz/v1",
            Symbol("archiveV2") => "https://archive.prod.nado.xyz/v2",
            Symbol("trigger") => "https://trigger.prod.nado.xyz/v1"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("gateway") => "https://gateway.test.nado.xyz/v1",
            Symbol("gatewayV2") => "https://gateway.test.nado.xyz/v2",
            Symbol("archive") => "https://archive.test.nado.xyz/v1",
            Symbol("archiveV2") => "https://archive.test.nado.xyz/v2",
            Symbol("trigger") => "https://trigger.test.nado.xyz/v1"
        ),
        Symbol("www") => "https://nado.xyz",
        Symbol("doc") => "https://docs.nado.xyz/"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("gateway") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("query") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("edge/query") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("query") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("execute") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("gatewayV2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("pairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("archive") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("archiveV2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("trigger") => Dict{Symbol, Any}(
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("execute") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("query") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => false,
        Symbol("walletAddress") => true,
        Symbol("privateKey") => true
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0001"),
            Symbol("taker") => self.parseNumber("0.00035")
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "swap",
        Symbol("recvWindow") => 5000,
        Symbol("expiration") => "4294967295",
        Symbol("subaccount") => "default",
        Symbol("editOrder") => Dict{Symbol, Any}(
            Symbol("placeRequiresUnfilled") => true
        ),
        Symbol("builderFee") => true,
        Symbol("builder") => "4500",
        Symbol("feeRate") => "10"
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => 60,
        Symbol("5m") => 300,
        Symbol("15m") => 900,
        Symbol("1h") => 3600,
        Symbol("2h") => 7200,
        Symbol("4h") => 14400,
        Symbol("1d") => 86400,
        Symbol("1w") => 604800,
        Symbol("4w") => 2419200
    ),
    Symbol("features") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("1000") => RateLimitExceeded,
            Symbol("1015") => RateLimitExceeded,
            Symbol("1001") => PermissionDenied,
            Symbol("1002") => RestrictedLocation,
            Symbol("1003") => RestrictedLocation,
            Symbol("1004") => OnMaintenance,
            Symbol("2000") => InvalidOrder,
            Symbol("2001") => InvalidOrder,
            Symbol("2002") => InvalidOrder,
            Symbol("2003") => InvalidOrder,
            Symbol("2004") => InvalidOrder,
            Symbol("2005") => OperationRejected,
            Symbol("2006") => InsufficientFunds,
            Symbol("2007") => InvalidOrder,
            Symbol("2008") => OrderImmediatelyFillable,
            Symbol("2009") => InvalidOrder,
            Symbol("2010") => InvalidOrder,
            Symbol("2011") => InvalidNonce,
            Symbol("2012") => InvalidNonce,
            Symbol("2013") => DuplicateOrderId,
            Symbol("2014") => PermissionDenied,
            Symbol("2015") => BadSymbol,
            Symbol("2016") => BadSymbol,
            Symbol("2017") => InsufficientFunds,
            Symbol("2019") => InvalidOrder,
            Symbol("2020") => OrderNotFound,
            Symbol("2021") => PermissionDenied,
            Symbol("2022") => InvalidNonce,
            Symbol("2023") => OperationRejected,
            Symbol("2024") => InvalidAddress,
            Symbol("2025") => InsufficientFunds,
            Symbol("2026") => BadRequest,
            Symbol("2027") => BadRequest,
            Symbol("2028") => AuthenticationError,
            Symbol("2029") => BadRequest,
            Symbol("2030") => RateLimitExceeded,
            Symbol("2031") => OrderNotFillable,
            Symbol("2033") => InvalidNonce,
            Symbol("2034") => AuthenticationError,
            Symbol("2035") => AuthenticationError,
            Symbol("2036") => InsufficientFunds,
            Symbol("2037") => InsufficientFunds,
            Symbol("2038") => BadRequest,
            Symbol("2039") => BadRequest,
            Symbol("2040") => BadRequest,
            Symbol("2041") => BadRequest,
            Symbol("2042") => OperationRejected,
            Symbol("2043") => InsufficientFunds,
            Symbol("2044") => OperationRejected,
            Symbol("2045") => InvalidOrder,
            Symbol("2046") => InvalidOrder,
            Symbol("2047") => InvalidOrder,
            Symbol("2048") => InvalidOrder,
            Symbol("2049") => OperationFailed,
            Symbol("2050") => PermissionDenied,
            Symbol("2051") => OperationRejected,
            Symbol("2052") => InvalidOrder,
            Symbol("2053") => OperationFailed,
            Symbol("2054") => InvalidOrder,
            Symbol("2055") => InvalidOrder,
            Symbol("2056") => OrderNotFillable,
            Symbol("2057") => OperationRejected,
            Symbol("2058") => OrderNotFound,
            Symbol("2059") => InvalidOrder,
            Symbol("2060") => BadSymbol,
            Symbol("2061") => BadRequest,
            Symbol("2062") => ArgumentsRequired,
            Symbol("2063") => BadResponse,
            Symbol("2064") => InvalidOrder,
            Symbol("2065") => InvalidOrder,
            Symbol("2066") => InvalidOrder,
            Symbol("2067") => InvalidOrder,
            Symbol("2068") => OnMaintenance,
            Symbol("2069") => OperationRejected,
            Symbol("2070") => OperationRejected,
            Symbol("2071") => OperationRejected,
            Symbol("2072") => InvalidOrder,
            Symbol("2073") => InvalidOrder,
            Symbol("2074") => BadRequest,
            Symbol("2075") => InvalidOrder,
            Symbol("2076") => InvalidOrder,
            Symbol("2077") => BadRequest,
            Symbol("2078") => RateLimitExceeded,
            Symbol("2079") => BadRequest,
            Symbol("2080") => BadRequest,
            Symbol("2081") => InvalidOrder,
            Symbol("2082") => BadSymbol,
            Symbol("2083") => InvalidOrder,
            Symbol("2084") => InvalidOrder,
            Symbol("2085") => InvalidOrder,
            Symbol("2086") => BadRequest,
            Symbol("2087") => OperationFailed,
            Symbol("2088") => InvalidOrder,
            Symbol("2089") => BadRequest,
            Symbol("2090") => BadRequest,
            Symbol("2091") => BadRequest,
            Symbol("2092") => InsufficientFunds,
            Symbol("2093") => OperationRejected,
            Symbol("2094") => InvalidOrder,
            Symbol("2095") => InvalidOrder,
            Symbol("2096") => InsufficientFunds,
            Symbol("2097") => InvalidOrder,
            Symbol("2098") => InvalidOrder,
            Symbol("2099") => InvalidOrder,
            Symbol("2100") => InvalidOrder,
            Symbol("2101") => InvalidOrder,
            Symbol("2102") => InvalidOrder,
            Symbol("2103") => InvalidOrder,
            Symbol("2104") => InvalidOrder,
            Symbol("2105") => InvalidOrder,
            Symbol("2106") => InvalidOrder,
            Symbol("2107") => InvalidOrder,
            Symbol("2108") => InvalidOrder,
            Symbol("2109") => InvalidOrder,
            Symbol("2110") => InvalidOrder,
            Symbol("2111") => InvalidOrder,
            Symbol("2112") => InvalidOrder,
            Symbol("2113") => InvalidOrder,
            Symbol("2114") => InvalidOrder,
            Symbol("2115") => OperationFailed,
            Symbol("2117") => InvalidOrder,
            Symbol("2118") => BadRequest,
            Symbol("2119") => InvalidOrder,
            Symbol("2120") => OperationFailed,
            Symbol("2121") => OperationFailed,
            Symbol("2122") => InvalidOrder,
            Symbol("2123") => BadRequest,
            Symbol("2124") => InvalidOrder,
            Symbol("2125") => OperationRejected,
            Symbol("3000") => BadRequest,
            Symbol("3001") => BadRequest,
            Symbol("3002") => ArgumentsRequired,
            Symbol("3003") => BadRequest,
            Symbol("3004") => BadRequest,
            Symbol("3005") => OperationFailed,
            Symbol("4000") => BadRequest,
            Symbol("4001") => NotSupported,
            Symbol("4002") => ExchangeNotAvailable,
            Symbol("4003") => OperationFailed,
            Symbol("4004") => OperationRejected,
            Symbol("5000") => ExchangeNotAvailable
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function createOrder(self::Nado, symbol, type_var, side, amount, price=nothing, params=Dict())
    self.checkRequiredCredentials();
    self.loadMarkets();
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    placeOrder = self.safeDict(request, "place_order", Dict{Symbol, Any}());
    isTriggerOrder = (ccxt_in("trigger", placeOrder));
    response = nothing;
    if functions.ccxtruthy(isTriggerOrder)
        response = self.triggerPrivatePostExecute(request);
    else
        response = self.gatewayPrivatePostExecute(request);
    end
    return self.parseOrder(extend(Dict{Symbol, Any}(
    Symbol("place_order") => placeOrder
), response), market)

end
function createOrderRequest(self::Nado, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    if functions.ccxtruthy(type_var != "limit")
        throw(InvalidOrder(string(self.id, " createOrder() supports limit orders only")));
    end
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument")));
    end
    productId = self.parseToInt(get(market, Symbol("id"), nothing));
    priceString = self.priceToPrecision(symbol, price);
    amountString = self.amountToPrecision(symbol, amount);
    priceX18 = self.convertToX18(priceString);
    amountX18 = self.convertToX18(amountString);
    if functions.ccxtruthy(side == "sell")
        amountX18 = stringMul(amountX18, "-1");
    end
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "createOrder", "subaccount", "default");
    expiration = nothing;
    (expiration, params) = self.handleOptionAndParams(params, "createOrder", "expiration", "4294967295");
    recvWindow = nothing;
    (recvWindow, params) = self.handleOptionAndParams(params, "createOrder", "recvWindow", 5000);
    nonce = self.createOrderNonce(recvWindow);
    requestId = safeInteger(params, "id");
    spotLeverage = self.safeBool2(params, "spotLeverage", "spot_leverage");
    sender = self.createSubaccount(self.walletAddress, subaccount);
    order = Dict{Symbol, Any}(
        Symbol("sender") => sender,
        Symbol("priceX18") => priceX18,
        Symbol("amount") => amountX18,
        Symbol("expiration") => expiration,
        Symbol("nonce") => nonce
    );
    placeOrder = Dict{Symbol, Any}(
        Symbol("product_id") => productId
    );
    if functions.ccxtruthy(requestId != nothing)
        placeOrder[Symbol("id")] = requestId;
    end
    if functions.ccxtruthy(spotLeverage != nothing)
        placeOrder[Symbol("spot_leverage")] = spotLeverage;
    end
    isBuy = (side == "buy");
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossTriggerPrice = safeString(params, "stopLossPrice");
    takeProfitTriggerPrice = safeString(params, "takeProfitPrice");
    isStopLossOrder = stopLossTriggerPrice != nothing;
    isTakeProfitOrder = takeProfitTriggerPrice != nothing;
    isStopOrder = triggerPrice != nothing;
    isTriggerOrder = @functions.ccxt_or(@functions.ccxt_or(isStopOrder, isStopLossOrder), isTakeProfitOrder);
    if functions.ccxtruthy(isStopOrder)
        triggerDirection = safeStringLower(params, "triggerDirection");
        if functions.ccxtruthy(triggerDirection == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires triggerDirection for trigger order")));
        end
        triggerPriceX18 = self.convertToX18(triggerPrice);
        priceRequirement = Dict{Symbol, Any}();
        priceRequirement[Symbol(string("oracle_price_", triggerDirection))] = triggerPriceX18;
        trigger = Dict{Symbol, Any}(
            Symbol("price_trigger") => Dict{Symbol, Any}(
                Symbol("price_requirement") => priceRequirement
            )
        );
        placeOrder[Symbol("trigger")] = trigger;
    elseif functions.ccxtruthy(@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder))
        triggerDirection = "";
        if functions.ccxtruthy(isBuy)
            triggerDirection = functions.ccxtruthy(isStopLossOrder) ? "above" : "below";
        else
            triggerDirection = functions.ccxtruthy(isStopLossOrder) ? "below" : "above";
        end
        triggerPrice = functions.ccxtruthy(isStopLossOrder) ? stopLossTriggerPrice : takeProfitTriggerPrice;
        triggerPriceX18 = self.convertToX18(triggerPrice);
        priceRequirement = Dict{Symbol, Any}();
        priceRequirement[Symbol(string("oracle_price_", triggerDirection))] = triggerPriceX18;
        trigger = Dict{Symbol, Any}(
            Symbol("price_trigger") => Dict{Symbol, Any}(
                Symbol("price_requirement") => priceRequirement
            )
        );
        placeOrder[Symbol("trigger")] = trigger;
    end
    appendix = safeString(params, "appendix");
    if functions.ccxtruthy(appendix == nothing)
        appendix = self.createOrderAppendix(isTriggerOrder, params);
    end
    order[Symbol("appendix")] = appendix;
    contracts = self.queryContracts();
    chainId = safeString(contracts, "chain_id");
    signature = self.signOrder(order, productId, chainId);
    placeOrder[Symbol("order")] = order;
    placeOrder[Symbol("signature")] = signature;
    params = omit(params, ["expiration", "nonce", "appendix", "reduceOnly", "postOnly", "timeInForce", "id", "spotLeverage", "spot_leverage", "triggerPrice", "stopPrice", "triggerDirection", "stopLossPrice", "takeProfitPrice"]);
    request = Dict{Symbol, Any}(
        Symbol("place_order") => placeOrder
    );
    return extend(request, params)

end
function editOrder(self::Nado, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    self.checkRequiredCredentials();
    self.loadMarkets();
    market = self.market(symbol);
    request = self.editOrderRequest(id, symbol, type_var, side, amount, price, params);
    response = self.gatewayPrivatePostExecute(request);
    cancelAndPlace = self.safeDict(request, "cancel_and_place", Dict{Symbol, Any}());
    placeOrder = self.safeDict(cancelAndPlace, "place_order", Dict{Symbol, Any}());
    return self.parseOrder(extend(Dict{Symbol, Any}(
    Symbol("place_order") => placeOrder
), response), market)

end
function editOrderRequest(self::Nado, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    market = self.market(symbol);
    if functions.ccxtruthy(type_var != "limit")
        throw(InvalidOrder(string(self.id, " editOrder() supports limit orders only")));
    end
    if functions.ccxtruthy(amount == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an amount argument")));
    end
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a price argument")));
    end
    productId = self.parseToInt(get(market, Symbol("id"), nothing));
    priceString = self.priceToPrecision(symbol, price);
    amountString = self.amountToPrecision(symbol, amount);
    priceX18 = self.convertToX18(priceString);
    amountX18 = self.convertToX18(amountString);
    if functions.ccxtruthy(side == "sell")
        amountX18 = stringMul(amountX18, "-1");
    end
    editOrderOptions = self.safeDict(self.options, "editOrder", Dict{Symbol, Any}());
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "editOrder", "subaccount", "default");
    expiration = nothing;
    (expiration, params) = self.handleOptionAndParams(params, "editOrder", "expiration", "4294967295");
    recvWindow = nothing;
    (recvWindow, params) = self.handleOptionAndParams(params, "editOrder", "recvWindow", 5000);
    cancelNonce = self.createOrderNonce(recvWindow);
    orderNonce = stringAdd(cancelNonce, "1");
    appendix = safeString(params, "appendix");
    if functions.ccxtruthy(appendix == nothing)
        appendix = self.createOrderAppendix(false, params);
    end
    requestId = safeInteger(params, "id");
    spotLeverage = self.safeBool2(params, "spotLeverage", "spot_leverage");
    placeRequiresUnfilled = self.safeBool2(params, "placeRequiresUnfilled", "place_requires_unfilled", self.safeBool(editOrderOptions, "placeRequiresUnfilled", true));
    params = omit(params, ["expiration", "nonce", "appendix", "reduceOnly", "postOnly", "timeInForce", "id", "spotLeverage", "spot_leverage", "placeRequiresUnfilled", "place_requires_unfilled"]);
    sender = self.createSubaccount(self.walletAddress, subaccount);
    cancelTx = Dict{Symbol, Any}(
        Symbol("sender") => sender,
        Symbol("productIds") => [productId],
        Symbol("digests") => [id],
        Symbol("nonce") => cancelNonce
    );
    order = Dict{Symbol, Any}(
        Symbol("sender") => sender,
        Symbol("priceX18") => priceX18,
        Symbol("amount") => amountX18,
        Symbol("expiration") => expiration,
        Symbol("nonce") => orderNonce,
        Symbol("appendix") => appendix
    );
    contracts = self.queryContracts();
    chainId = safeString(contracts, "chain_id");
    endpointAddress = safeString(contracts, "endpoint_addr");
    if functions.ccxtruthy(endpointAddress == nothing)
        throw(ExchangeError(string(self.id, " editOrder() requires endpoint_addr from contracts query")));
    end
    cancelSignature = self.signCancellation(cancelTx, chainId, endpointAddress);
    orderSignature = self.signOrder(order, productId, chainId);
    placeOrder = Dict{Symbol, Any}(
        Symbol("product_id") => productId,
        Symbol("order") => order,
        Symbol("signature") => orderSignature
    );
    if functions.ccxtruthy(requestId != nothing)
        placeOrder[Symbol("id")] = requestId;
    end
    if functions.ccxtruthy(spotLeverage != nothing)
        placeOrder[Symbol("spot_leverage")] = spotLeverage;
    end
    cancelAndPlace = Dict{Symbol, Any}(
        Symbol("cancel_tx") => cancelTx,
        Symbol("cancel_signature") => cancelSignature,
        Symbol("place_order") => placeOrder,
        Symbol("place_requires_unfilled") => placeRequiresUnfilled
    );
    request = Dict{Symbol, Any}(
        Symbol("cancel_and_place") => cancelAndPlace
    );
    return extend(request, params)

end
function cancelOrder(self::Nado, id, symbol=nothing, params=Dict())
    orders = self.cancelOrders([id], symbol, params);
    return self.safeDict(orders, 0)

end
function cancelAllOrders(self::Nado, symbol=nothing, params=Dict())
    self.checkRequiredCredentials();
    self.loadMarkets();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    request = self.cancelAllOrdersRequest(symbol, params);
    response = nothing;
    if functions.ccxtruthy(trigger)
        response = self.triggerPrivatePostExecute(request);
    else
        response = self.gatewayPrivatePostExecute(request);
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    cancelledOrders = self.safeList(data, "cancelled_orders", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(cancelledOrders)))
        push!(result, self.parseOrder(extend(Dict{Symbol, Any}(
    Symbol("status") => "canceled"
), get(cancelledOrders, i + 1, nothing)), market));
        i += 1
    end
    return result

end
function cancelAllOrdersRequest(self::Nado, symbol=nothing, params=Dict())
    productIds = [];
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
                push!(productIds, self.parseToInt(get(market, Symbol("id"), nothing)));
    end
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "cancelAllOrders", "subaccount", "default");
    sender = self.createSubaccount(self.walletAddress, subaccount);
    recvWindow = nothing;
    (recvWindow, params) = self.handleOptionAndParams(params, "cancelAllOrders", "recvWindow", 5000);
    nonce = self.createOrderNonce(recvWindow);
    tx = Dict{Symbol, Any}(
        Symbol("sender") => sender,
        Symbol("productIds") => productIds,
        Symbol("nonce") => nonce
    );
    contracts = self.queryContracts();
    chainId = safeString(contracts, "chain_id");
    endpointAddress = safeString(contracts, "endpoint_addr");
    if functions.ccxtruthy(endpointAddress == nothing)
        throw(ExchangeError(string(self.id, " cancelAllOrders() requires endpoint_addr from contracts query")));
    end
    signature = self.signCancellationProducts(tx, chainId, endpointAddress);
    requestId = safeInteger(params, "id");
    params = omit(params, ["id"]);
    cancelProductOrders = Dict{Symbol, Any}(
        Symbol("tx") => tx,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(requestId != nothing)
        cancelProductOrders[Symbol("id")] = requestId;
    end
    request = Dict{Symbol, Any}(
        Symbol("cancel_product_orders") => cancelProductOrders
    );
    return extend(request, params)

end
function cancelOrders(self::Nado, ids, symbol=nothing, params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    self.loadMarkets();
    market = self.market(symbol);
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    request = self.cancelOrdersRequest(ids, symbol, params);
    response = nothing;
    if functions.ccxtruthy(trigger)
        response = self.triggerPrivatePostExecute(request);
    else
        response = self.gatewayPrivatePostExecute(request);
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    cancelledOrders = self.safeList(data, "cancelled_orders", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(cancelledOrders)))
        push!(result, self.parseOrder(extend(Dict{Symbol, Any}(
    Symbol("status") => "canceled"
), get(cancelledOrders, i + 1, nothing)), market));
        i += 1
    end
    return result

end
function cancelOrdersRequest(self::Nado, ids, symbol=nothing, params=Dict())
    market = self.market(symbol);
    productId = self.parseToInt(get(market, Symbol("id"), nothing));
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "cancelOrders", "subaccount", "default");
    sender = self.createSubaccount(self.walletAddress, subaccount);
    productIds = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        push!(productIds, productId);
        i += 1
    end
    recvWindow = nothing;
    (recvWindow, params) = self.handleOptionAndParams(params, "cancelOrders", "recvWindow", 5000);
    nonce = self.createOrderNonce(recvWindow);
    tx = Dict{Symbol, Any}(
        Symbol("sender") => sender,
        Symbol("productIds") => productIds,
        Symbol("digests") => ids,
        Symbol("nonce") => nonce
    );
    contracts = self.queryContracts();
    chainId = safeString(contracts, "chain_id");
    endpointAddress = safeString(contracts, "endpoint_addr");
    if functions.ccxtruthy(endpointAddress == nothing)
        throw(ExchangeError(string(self.id, " Ccxt.cancelOrders() requires endpoint_addr from contracts query")));
    end
    signature = self.signCancellation(tx, chainId, endpointAddress);
    requestId = safeInteger(params, "id");
    requiredUnfilledAmountRaw = safeString(params, "required_unfilled_amount");
    requiredUnfilledAmount = safeString(params, "requiredUnfilledAmount");
    params = omit(params, ["id", "requiredUnfilledAmount", "required_unfilled_amount"]);
    cancelOrders = Dict{Symbol, Any}(
        Symbol("tx") => tx,
        Symbol("signature") => signature
    );
    if functions.ccxtruthy(requiredUnfilledAmountRaw != nothing)
        cancelOrders[Symbol("required_unfilled_amount")] = requiredUnfilledAmountRaw;
    elseif functions.ccxtruthy(requiredUnfilledAmount != nothing)
        cancelOrders[Symbol("required_unfilled_amount")] = self.convertToX18(requiredUnfilledAmount);
    end
    if functions.ccxtruthy(requestId != nothing)
        cancelOrders[Symbol("id")] = requestId;
    end
    request = Dict{Symbol, Any}(
        Symbol("cancel_orders") => cancelOrders
    );
    return extend(request, params)

end
function fetchOrder(self::Nado, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    self.loadMarkets();
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => "order",
        Symbol("product_id") => self.parseToInt(get(market, Symbol("id"), nothing)),
        Symbol("digest") => id
    );
    response = self.gatewayPublicGetQuery(extend(request, params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function fetchOrders(self::Nado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    self.loadMarkets();
    productIds = [];
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
                push!(productIds, self.parseToInt(get(market, Symbol("id"), nothing)));
    end
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "fetchOrders", "subaccount", "default");
    sender = self.createSubaccount(self.walletAddress, subaccount);
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(!functions.ccxtruthy(trigger))
        throw(NotSupported(string(self.id, " fetchOrders only support trigger")));
    end
    recvWindow = nothing;
    (recvWindow, params) = self.handleOptionAndParams(params, "fetchOrders", "recvWindow", 5000);
    tx = Dict{Symbol, Any}(
        Symbol("sender") => sender,
        Symbol("recvTime") => numberToString(milliseconds() + recvWindow)
    );
    request = Dict{Symbol, Any}(
        Symbol("tx") => tx,
        Symbol("type") => "list_trigger_orders",
        Symbol("product_ids") => productIds
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    contracts = self.queryContracts();
    chainId = safeString(contracts, "chain_id");
    endpointAddress = safeString(contracts, "endpoint_addr");
    signature = self.signFetchTriggerOrders(tx, chainId, endpointAddress);
    request[Symbol("signature")] = signature;
    response = self.triggerPrivatePostQuery(extend(request, params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(data, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Nado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires walletAddress")));
    end
    self.loadMarkets();
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "subaccount", "default");
    sender = self.createSubaccount(self.walletAddress, subaccount);
    trigger = self.safeBool2(params, "stop", "trigger");
    if functions.ccxtruthy(trigger)
            return self.fetchOrders(symbol, since, nothing, extend(params, Dict{Symbol, Any}(
    Symbol("status_types") => ["waiting_price", "waiting_dependency"]
)))
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("sender") => sender,
        Symbol("type") => "subaccount_orders",
        Symbol("product_id") => self.parseToInt(get(market, Symbol("id"), nothing))
    );
    response = self.gatewayPublicGetQuery(extend(request, params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(data, "orders", []);
    return self.parseOrders(orders, market, since, limit, Dict{Symbol, Any}(
    Symbol("status") => "open"
))

end
function fetchClosedOrders(self::Nado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedOrders() requires walletAddress")));
    end
    self.loadMarkets();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "subaccount", "default");
    sender = self.createSubaccount(self.walletAddress, subaccount);
    trigger = self.safeBool2(params, "stop", "trigger");
    if functions.ccxtruthy(trigger)
            return self.fetchOrders(symbol, since, nothing, extend(params, Dict{Symbol, Any}(
    Symbol("status_types") => ["triggered", "triggering", "twap_executing", "twap_completed"]
)))
    end
    ordersRequest = Dict{Symbol, Any}(
        Symbol("subaccounts") => [sender]
    );
    if functions.ccxtruthy(market != nothing)
        ordersRequest[Symbol("product_ids")] = [self.parseToInt(get(market, Symbol("id"), nothing))];
    end
    (ordersRequest, params) = self.handleUntilOption("max_time", ordersRequest, params, 0.001);
    if functions.ccxtruthy(limit != nothing)
        ordersRequest[Symbol("limit")] = min(limit, 500);
    end
    request = Dict{Symbol, Any}(
        Symbol("orders") => ordersRequest
    );
    response = self.archivePost(deepExtend(request, params));
    closedOrders = [];
    orders = self.safeList(response, "orders", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        if functions.ccxtruthy(self.isArchiveOrderClosed(order))
                        push!(closedOrders, extend(Dict{Symbol, Any}(
    Symbol("status") => "closed"
), order));
        end
        i += 1
    end
    return self.parseOrders(closedOrders, market, since, limit)

end
function fetchCanceledOrders(self::Nado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return self.fetchOrders(symbol, since, nothing, extend(params, Dict{Symbol, Any}(
    Symbol("status_types") => ["cancelled", "internal_error"]
)))

end
function fetchCanceledAndClosedOrders(self::Nado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return self.fetchOrders(symbol, since, nothing, extend(params, Dict{Symbol, Any}(
    Symbol("status_types") => ["cancelled", "internal_error", "triggered", "triggering", "twap_executing", "twap_completed"]
)))

end
function fetchMyTrades(self::Nado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires walletAddress")));
    end
    self.loadMarkets();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "fetchMyTrades", "subaccount", "default");
    matchesRequest = Dict{Symbol, Any}(
        Symbol("subaccounts") => [self.createSubaccount(self.walletAddress, subaccount)]
    );
    if functions.ccxtruthy(market != nothing)
        matchesRequest[Symbol("product_ids")] = [self.parseToInt(get(market, Symbol("id"), nothing))];
    end
    (matchesRequest, params) = self.handleUntilOption("max_time", matchesRequest, params, 0.001);
    if functions.ccxtruthy(limit != nothing)
        matchesRequest[Symbol("limit")] = min(limit, 500);
    end
    request = Dict{Symbol, Any}(
        Symbol("matches") => matchesRequest
    );
    response = self.archivePost(deepExtend(request, params));
    matches = self.safeList(response, "matches", []);
    txs = self.safeList(response, "txs", []);
    txsBySubmission = indexBy(txs, "submission_idx");
    trades = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(matches)))
        match_var = get(matches, i + 1, nothing);
        submissionIdx = safeString(match_var, "submission_idx");
        tx = self.safeDict(txsBySubmission, submissionIdx, Dict{Symbol, Any}());
        push!(trades, extend(tx, match_var));
        i += 1
    end
    return self.parseTrades(trades, market, since, limit)

end
function fetchBalance(self::Nado, params=Dict())
    if functions.ccxtruthy(self.walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchBalance() requires walletAddress")));
    end
    self.loadMarkets();
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "fetchBalance", "subaccount", "default");
    request = Dict{Symbol, Any}(
        Symbol("type") => "subaccount_info",
        Symbol("subaccount") => self.createSubaccount(self.walletAddress, subaccount)
    );
    response = self.gatewayPublicGetQuery(extend(request, params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseBalance(data)

end
function fetchDeposits(self::Nado, code=nothing, since=nothing, limit=nothing, params=Dict())
    return self.queryTransactionsByEventType("deposit_collateral", "deposit", "fetchDeposits", code, since, limit, params)

end
function fetchWithdrawals(self::Nado, code=nothing, since=nothing, limit=nothing, params=Dict())
    return self.queryTransactionsByEventType("withdraw_collateral", "withdrawal", "fetchWithdrawals", code, since, limit, params)

end
function queryTransactionsByEventType(self::Nado, eventType, transactionType, methodName, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires walletAddress")));
    end
    self.loadMarkets();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, methodName, "subaccount", "default");
    eventsRequest = Dict{Symbol, Any}(
        Symbol("subaccounts") => [self.createSubaccount(self.walletAddress, subaccount)],
        Symbol("event_types") => [eventType],
        Symbol("limit") => Dict{Symbol, Any}(
            Symbol("raw") => functions.ccxtruthy((limit == nothing)) ? 100 : min(limit, 500)
        )
    );
    if functions.ccxtruthy(currency != nothing)
        eventsRequest[Symbol("product_ids")] = [self.parseToInt(get(currency, Symbol("id"), nothing))];
    end
    (eventsRequest, params) = self.handleUntilOption("max_time", eventsRequest, params, 0.001);
    request = Dict{Symbol, Any}(
        Symbol("events") => eventsRequest
    );
    response = self.archivePost(deepExtend(request, params));
    events = self.safeList(response, "events", []);
    txs = self.safeList(response, "txs", []);
    transactions = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(events)))
        event = get(events, i + 1, nothing);
        submissionIdx = safeString(event, "submission_idx");
        tx = Dict{Symbol, Any}();
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(txs)))
            rawTx = get(txs, j + 1, nothing);
            txSubmissionIdx = safeString(rawTx, "submission_idx");
            if functions.ccxtruthy(txSubmissionIdx == submissionIdx)
                tx = rawTx;
                break
            end
            j += 1
        end
        transaction = extend(Dict{Symbol, Any}(), tx);
        transaction = extend(transaction, event);
        transaction[Symbol("transaction_type")] = transactionType;
        push!(transactions, self.parseTransaction(transaction, currency));
        i += 1
    end
    return self.filterByCurrencySinceLimit(transactions, code, since, limit)

end
function fetchPositions(self::Nado, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchPositions() requires walletAddress")));
    end
    self.loadMarkets();
    symbols = self.marketSymbols(symbols);
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "fetchPositions", "subaccount", "default");
    request = Dict{Symbol, Any}(
        Symbol("type") => "subaccount_info",
        Symbol("subaccount") => self.createSubaccount(self.walletAddress, subaccount)
    );
    response = self.gatewayPublicGetQuery(extend(request, params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    positions = self.safeList(data, "perp_balances", []);
    products = self.safeList(data, "perp_products", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        position = get(positions, i + 1, nothing);
        balance = self.safeDict(position, "balance", Dict{Symbol, Any}());
        amount = safeString(balance, "amount");
        if functions.ccxtruthy(@functions.ccxt_or((amount == nothing), stringEquals(amount, "0")))
            i += 1; continue
        end
        productId = safeString(position, "product_id");
        product = Dict{Symbol, Any}();
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(products)))
            rawProduct = get(products, j + 1, nothing);
            rawProductId = safeString(rawProduct, "product_id");
            if functions.ccxtruthy(rawProductId == productId)
                product = rawProduct;
                break
            end
            j += 1
        end
        push!(result, self.parsePosition(extend(Dict{Symbol, Any}(
    Symbol("product") => product
), position)));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function fetchTime(self::Nado, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => "time"
    );
    response = self.gatewayPublicGetEdgeQuery(extend(request, params));
    return safeInteger(response, "server_time")

end
function fetchStatus(self::Nado, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => "status"
    );
    response = self.gatewayPublicGetQuery(extend(request, params));
    status = safeString(response, "data");
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((status == "active")) ? "ok" : "error",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchMarkets(self::Nado, params=Dict())
    symbolsRequest = self.gatewayPublicGetSymbols(params);
    pairsRequest = self.gatewayV2PublicGetPairs(params);
    assetsRequest = self.gatewayV2PublicGetAssets(params);
    responses = asyncmap(Base.fetch, [symbolsRequest, pairsRequest, assetsRequest]);
    symbols = self.safeList(responses, 0, []);
    pairs_var = self.safeList(responses, 1, []);
    assets = self.safeList(responses, 2, []);
    pairsById = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(pairs_var)))
        rawPair = get(pairs_var, i + 1, nothing);
        pairProductId = safeString(rawPair, "product_id");
        if functions.ccxtruthy(pairProductId != nothing)
            pairsById[Symbol(pairProductId)] = rawPair;
        end
        i += 1
    end
    assetsById = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
        rawAsset = get(assets, i + 1, nothing);
        assetProductId = safeString(rawAsset, "product_id");
        if functions.ccxtruthy(assetProductId != nothing)
            assetsById[Symbol(assetProductId)] = rawAsset;
        end
        i += 1
    end
    assetsByCode = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
        rawAsset = get(assets, i + 1, nothing);
        assetSymbol = safeString(rawAsset, "symbol");
        assetCode = self.safeCurrencyCode(self.removeMarketSuffix(assetSymbol));
        if functions.ccxtruthy(assetCode == nothing)
            i += 1; continue
        end
        previous = self.safeDict(assetsByCode, assetCode);
        if functions.ccxtruthy(previous == nothing)
            assetsByCode[Symbol(assetCode)] = rawAsset;
        else
            previousDeposit = self.safeBool(previous, "can_deposit", false);
            previousWithdraw = self.safeBool(previous, "can_withdraw", false);
            currentDeposit = self.safeBool(rawAsset, "can_deposit", false);
            currentWithdraw = self.safeBool(rawAsset, "can_withdraw", false);
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(previousDeposit), !functions.ccxtruthy(previousWithdraw)), (@functions.ccxt_or(currentDeposit, currentWithdraw))))
                assetsByCode[Symbol(assetCode)] = rawAsset;
            end
        end
        i += 1
    end
    markets = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        market = get(symbols, i + 1, nothing);
        id = safeString(market, "product_id");
        pair = self.safeDict(pairsById, id, Dict{Symbol, Any}());
        asset = self.safeDict(assetsById, id, Dict{Symbol, Any}());
        rawType = safeString(market, "type");
        type_var = functions.ccxtruthy((rawType == "perp")) ? "swap" : rawType;
        contract = (type_var == "swap");
        tickerId = safeString2(pair, "ticker_id", "tickerId");
        if functions.ccxtruthy(tickerId == nothing)
            i += 1; continue
        end
        rawBaseId = safeString(market, "symbol");
        rawQuoteId = safeString(pair, "quote", "USDT0");
        base = self.safeCurrencyCode(self.removeMarketSuffix(rawBaseId));
        quote_var = self.safeCurrencyCode(rawQuoteId);
        baseAsset = self.safeDict(assetsByCode, base, asset);
        quoteAsset = self.safeDict(assetsByCode, quote_var);
        baseId = safeString(baseAsset, "product_id", rawBaseId);
        quoteId = safeString(quoteAsset, "product_id", rawQuoteId);
        settleId = functions.ccxtruthy(contract) ? quoteId : nothing;
        settle = functions.ccxtruthy(contract) ? quote_var : nothing;
        symbol = string(base, "/", quote_var);
        if functions.ccxtruthy(contract)
            symbol += string(":", settle);
        end
        tradingStatus = safeString(market, "trading_status");
        active = (tradingStatus != "not_tradable");
        priceIncrement = self.parseX18(safeString(market, "price_increment_x18"));
        amountIncrement = self.parseX18(safeString(market, "size_increment"));
        minCost = self.parseX18(safeString(market, "min_size"));
        push!(markets, self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("lowercaseId") => nothing,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => (type_var == "spot"),
    Symbol("margin") => nothing,
    Symbol("swap") => contract,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => functions.ccxtruthy(contract) ? true : nothing,
    Symbol("inverse") => functions.ccxtruthy(contract) ? false : nothing,
    Symbol("taker") => self.parseX18(safeString(market, "taker_fee_rate_x18")),
    Symbol("maker") => self.parseX18(safeString(market, "maker_fee_rate_x18")),
    Symbol("contractSize") => functions.ccxtruthy(contract) ? 1 : nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountIncrement,
        Symbol("price") => priceIncrement
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
            Symbol("min") => minCost,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => extend(market, Dict{Symbol, Any}(
    Symbol("ticker_id") => tickerId,
    Symbol("name") => safeString(asset, "name"),
    Symbol("v2Pair") => pair,
    Symbol("v2Asset") => asset
))
)));
        i += 1
    end
    return markets

end
function fetchCurrencies(self::Nado, params=Dict())
    response = self.gatewayV2PublicGetAssets(params);
    result = Dict{Symbol, Any}();
    assets = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
        currency = get(assets, i + 1, nothing);
        parsed = self.parseCurrency(currency);
        code = safeString(parsed, "code");
        if functions.ccxtruthy(code == nothing)
            i += 1; continue
        end
        previous = self.safeDict(result, code);
        canDeposit = self.safeBool(currency, "can_deposit", false);
        canWithdraw = self.safeBool(currency, "can_withdraw", false);
        if functions.ccxtruthy(previous == nothing)
            result[Symbol(code)] = parsed;
        else
            previousDeposit = self.safeBool(previous, "deposit", false);
            previousWithdraw = self.safeBool(previous, "withdraw", false);
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(previousDeposit), !functions.ccxtruthy(previousWithdraw)), (@functions.ccxt_or(canDeposit, canWithdraw))))
                result[Symbol(code)] = parsed;
            end
        end
        i += 1
    end
    return result

end
function fetchTickers(self::Nado, symbols=nothing, params=Dict())
    self.loadMarkets();
    symbols = self.marketSymbols(symbols);
    response = self.archiveV2PublicGetTickers(params);
    tickers = toArray(response);
    return self.parseTickers(tickers, symbols)

end
function fetchTicker(self::Nado, symbol, params=Dict())
    self.loadMarkets();
    market = self.market(symbol);
    tickers = self.fetchTickers([symbol], params);
    ticker = self.safeDict(tickers, symbol);
    if functions.ccxtruthy(ticker == nothing)
        throw(BadSymbol(string(self.id, " fetchTicker() ticker not found for ", symbol)));
    end
    return self.safeTicker(ticker, market)

end
function fetchFundingRate(self::Nado, symbol, params=Dict())
    self.loadMarkets();
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    tickerId = safeString(get(market, Symbol("info"), nothing), "ticker_id");
    response = self.archiveV2PublicGetContracts(params);
    data = self.safeDict(response, tickerId, Dict{Symbol, Any}());
    return self.parseFundingRate(data, market)

end
function fetchFundingHistory(self::Nado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires walletAddress")));
    end
    self.loadMarkets();
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingHistory() supports swap contracts only")));
    end
    subaccount = nothing;
    (subaccount, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "subaccount", "default");
    request = Dict{Symbol, Any}(
        Symbol("interest_and_funding") => Dict{Symbol, Any}(
            Symbol("subaccount") => self.createSubaccount(self.walletAddress, subaccount),
            Symbol("product_ids") => [self.parseToInt(get(market, Symbol("id"), nothing))],
            Symbol("limit") => functions.ccxtruthy((limit == nothing)) ? 100 : min(limit, 100)
        )
    );
    response = self.archivePost(deepExtend(request, params));
    fundingPayments = self.safeList(response, "funding_payments", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fundingPayments)))
        push!(result, self.parseFundingHistory(get(fundingPayments, i + 1, nothing), market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function fetchFundingRates(self::Nado, symbols=nothing, params=Dict())
    self.loadMarkets();
    symbols = self.marketSymbols(symbols, "swap", true);
    response = self.archiveV2PublicGetContracts(params);
    tickers = objectKeys(response);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        ticker = get(tickers, i + 1, nothing);
        push!(rates, self.safeDict(response, ticker, Dict{Symbol, Any}()));
        i += 1
    end
    return self.parseFundingRates(rates, symbols)

end
function fetchOpenInterest(self::Nado, symbol, params=Dict())
    self.loadMarkets();
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchOpenInterest() supports swap contracts only")));
    end
    tickerId = safeString(get(market, Symbol("info"), nothing), "ticker_id");
    response = self.archiveV2PublicGetContracts(params);
    data = self.safeDict(response, tickerId, Dict{Symbol, Any}());
    return self.parseOpenInterest(data, market)

end
function fetchOpenInterests(self::Nado, symbols=nothing, params=Dict())
    self.loadMarkets();
    symbols = self.marketSymbols(symbols, "swap", true);
    response = self.archiveV2PublicGetContracts(params);
    tickers = objectKeys(response);
    interests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        ticker = get(tickers, i + 1, nothing);
        push!(interests, self.safeDict(response, ticker, Dict{Symbol, Any}()));
        i += 1
    end
    return self.parseOpenInterests(interests, symbols)

end
function fetchOrderBook(self::Nado, symbol, limit=nothing, params=Dict())
    self.loadMarkets();
    market = self.market(symbol);
    tickerId = safeString(get(market, Symbol("info"), nothing), "ticker_id");
    request = Dict{Symbol, Any}(
        Symbol("ticker_id") => tickerId,
        Symbol("depth") => functions.ccxtruthy((limit == nothing)) ? 100 : limit
    );
    response = self.gatewayV2PublicGetOrderbook(extend(request, params));
    timestamp = safeInteger(response, "timestamp");
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp)

end
function fetchTrades(self::Nado, symbol, since=nothing, limit=nothing, params=Dict())
    self.loadMarkets();
    market = self.market(symbol);
    tickerId = safeString(get(market, Symbol("info"), nothing), "ticker_id");
    request = Dict{Symbol, Any}(
        Symbol("ticker_id") => tickerId
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 500);
    end
    response = self.archiveV2PublicGetTrades(extend(request, params));
    return self.parseTrades(response, market, since, limit)

end
function fetchOHLCV(self::Nado, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    self.loadMarkets();
    market = self.market(symbol);
    until = safeInteger(params, "until");
    params = omit(params, "until");
    request = Dict{Symbol, Any}(
        Symbol("candlesticks") => Dict{Symbol, Any}(
            Symbol("product_id") => self.parseToInt(get(market, Symbol("id"), nothing)),
            Symbol("granularity") => safeInteger(self.timeframes, timeframe, self.parseTimeframe(timeframe))
        )
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("candlesticks")][Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(until != nothing)
        request[Symbol("candlesticks")][Symbol("max_time")] = self.parseToInt(until / 1000);
    end
    response = self.archivePost(deepExtend(request, params));
    data = self.safeList(response, "candlesticks", []);
    return self.parseOHLCVs(data, market, timeframe, since, limit)

end
function parseOHLCV(self::Nado, ohlcv, market=nothing)
    return [safeTimestamp(ohlcv, "timestamp"), self.parseX18(safeString(ohlcv, "open_x18")), self.parseX18(safeString(ohlcv, "high_x18")), self.parseX18(safeString(ohlcv, "low_x18")), self.parseX18(safeString(ohlcv, "close_x18")), self.parseX18(safeString(ohlcv, "volume"))]

end
function parseTrade(self::Nado, trade, market=nothing)
    marketId = safeString(trade, "product_id");
    market = self.safeMarket(marketId, market);
    timestamp = safeTimestamp(trade, "timestamp");
    rawOrder = self.safeDict(trade, "order");
    isArchiveMatch = rawOrder != nothing;
    order = functions.ccxtruthy((rawOrder == nothing)) ? Dict{Symbol, Any}() : rawOrder;
    amountString = safeString(trade, "base_filled");
    costString = safeString(trade, "quote_filled");
    rawOrderAmount = safeString(order, "amount");
    side = safeString(trade, "trade_type");
    if functions.ccxtruthy(@functions.ccxt_and((side == nothing), (rawOrderAmount != nothing)))
        if functions.ccxtruthy(stringLt(rawOrderAmount, "0"))
            side = "sell";
        else
            side = "buy";
        end
    end
    price = safeString(trade, "price");
    if functions.ccxtruthy(price == nothing)
        parsedPrice = self.parseX18(safeString(order, "priceX18"));
        price = functions.ccxtruthy((parsedPrice == nothing)) ? nothing : numberToString(parsedPrice);
    end
    takerOrMaker = nothing;
    isTaker = self.safeBool(trade, "is_taker");
    if functions.ccxtruthy(isTaker != nothing)
        if functions.ccxtruthy(isTaker)
            takerOrMaker = "taker";
        else
            takerOrMaker = "maker";
        end
    end
    feeString = safeString(trade, "fee");
    feeCost = nothing;
    if functions.ccxtruthy(isArchiveMatch)
        feeCost = self.parseX18(feeString);
    else
        feeCost = self.parseNumber(feeString);
    end
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => get(market, Symbol("quote"), nothing)
        );
    end
    parsedAmount = nothing;
    if functions.ccxtruthy(amountString != nothing)
        absoluteAmount = stringAbs(amountString);
        if functions.ccxtruthy(isArchiveMatch)
            parsedAmount = self.parseX18(absoluteAmount);
        else
            parsedAmount = absoluteAmount;
        end
    end
    parsedCost = nothing;
    if functions.ccxtruthy(costString != nothing)
        absoluteCost = stringAbs(costString);
        if functions.ccxtruthy(isArchiveMatch)
            parsedCost = self.parseX18(absoluteCost);
        else
            parsedCost = absoluteCost;
        end
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => safeString2(trade, "trade_id", "submission_idx"),
    Symbol("order") => safeString(trade, "digest"),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => price,
    Symbol("amount") => parsedAmount,
    Symbol("cost") => parsedCost,
    Symbol("fee") => fee
), market)

end
function parseFundingRate(self::Nado, contract, market=nothing)
    marketId = safeString(contract, "product_id");
    market = self.safeMarket(marketId, market);
    fundingTimestamp = safeTimestamp(contract, "next_funding_rate_timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("markPrice") => self.safeNumber(contract, "mark_price"),
    Symbol("indexPrice") => self.safeNumber(contract, "index_price"),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "funding_rate"),
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => "24h"
)

end
function parseFundingHistory(self::Nado, funding, market=nothing)
    marketId = safeString(funding, "product_id");
    market = self.safeMarket(marketId, market);
    timestamp = safeTimestamp(funding, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => funding,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("code") => safeString(market, "settle"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(funding, "idx"),
    Symbol("amount") => self.parseX18(safeString(funding, "amount"))
)

end
function parseOpenInterest(self::Nado, interest, market=nothing)
    marketId = safeString(interest, "product_id");
    market = self.safeMarket(marketId, market);
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("openInterestAmount") => self.safeNumber(interest, "open_interest"),
    Symbol("openInterestValue") => self.safeNumber(interest, "open_interest_usd"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => interest
), market)

end
function parseTicker(self::Nado, ticker, market=nothing)
    marketId = safeString(ticker, "product_id");
    market = self.safeMarket(marketId, market);
    timestamp = nothing;
    last_var = safeString(ticker, "last_price");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => nothing,
    Symbol("low") => nothing,
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => safeString(ticker, "price_change_percent_24h"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "base_volume"),
    Symbol("quoteVolume") => safeString(ticker, "quote_volume"),
    Symbol("info") => ticker
), market)

end
function parseCurrency(self::Nado, rawCurrency)
    canDeposit = self.safeBool(rawCurrency, "can_deposit", false);
    canWithdraw = self.safeBool(rawCurrency, "can_withdraw", false);
    id = safeString(rawCurrency, "product_id");
    currencyId = safeString(rawCurrency, "symbol");
    code = self.safeCurrencyCode(self.removeMarketSuffix(currencyId));
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => safeString(rawCurrency, "name"),
    Symbol("code") => code,
    Symbol("precision") => nothing,
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("networks") => Dict{Symbol, Any}(),
    Symbol("deposit") => canDeposit,
    Symbol("withdraw") => canWithdraw,
    Symbol("type") => "crypto",
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => rawCurrency
))

end
function parseBalance(self::Nado, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "spot_balances", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        rawBalance = get(balances, i + 1, nothing);
        currencyId = safeString(rawBalance, "product_id");
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(code == "0")
            code = "USDT0";
        elseif functions.ccxtruthy(code == currencyId)
            market = self.safeMarket(currencyId, nothing, nothing, "spot");
            if functions.ccxtruthy(self.safeBool(market, "spot"))
                code = safeString(market, "base", code);
            end
        end
        balance = self.safeDict(rawBalance, "balance", Dict{Symbol, Any}());
        amount = stringDiv(safeString(balance, "amount"), "1000000000000000000");
        account = self.account();
        account[Symbol("total")] = amount;
        account[Symbol("free")] = amount;
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function parseTransaction(self::Nado, transaction, currency=nothing)
    currencyId = safeString(transaction, "product_id");
    code = self.safeCurrencyCode(currencyId, currency);
    timestamp = safeTimestamp(transaction, "timestamp");
    preBalance = self.safeDict(transaction, "pre_balance", Dict{Symbol, Any}());
    postBalance = self.safeDict(transaction, "post_balance", Dict{Symbol, Any}());
    preSpot = self.safeDict(preBalance, "spot", Dict{Symbol, Any}());
    postSpot = self.safeDict(postBalance, "spot", Dict{Symbol, Any}());
    preSpotBalance = self.safeDict(preSpot, "balance", Dict{Symbol, Any}());
    postSpotBalance = self.safeDict(postSpot, "balance", Dict{Symbol, Any}());
    preAmount = safeString(preSpotBalance, "amount", "0");
    postAmount = safeString(postSpotBalance, "amount", "0");
    amount = self.parseX18(stringAbs(stringSub(postAmount, preAmount)));
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "submission_idx"),
    Symbol("txid") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("type") => safeString(transaction, "transaction_type"),
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => "ok",
    Symbol("updated") => nothing,
    Symbol("fee") => nothing,
    Symbol("network") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing
)

end
function parsePosition(self::Nado, position, market=nothing)
    marketId = safeString(position, "product_id");
    market = self.safeMarket(marketId, market);
    balance = self.safeDict(position, "balance", Dict{Symbol, Any}());
    amountString = safeString(balance, "amount");
    product = self.safeDict(position, "product", Dict{Symbol, Any}());
    risk = self.safeDict(product, "risk", Dict{Symbol, Any}());
    markPriceX18 = safeString2(risk, "price_x18", "oracle_price_x18");
    vQuoteBalance = safeString(balance, "v_quote_balance");
    side = nothing;
    contracts = nothing;
    entryPrice = nothing;
    markPrice = nothing;
    notional = nothing;
    if functions.ccxtruthy(amountString != nothing)
        if functions.ccxtruthy(stringGt(amountString, "0"))
            side = "long";
        elseif functions.ccxtruthy(stringLt(amountString, "0"))
            side = "short";
        end
        absoluteAmount = stringAbs(amountString);
        contracts = self.parseX18(absoluteAmount);
        if functions.ccxtruthy(@functions.ccxt_and((vQuoteBalance != nothing), !functions.ccxtruthy(stringEquals(absoluteAmount, "0"))))
            entryPrice = self.parseNumber(stringDiv(stringAbs(vQuoteBalance), absoluteAmount));
        end
        if functions.ccxtruthy(markPriceX18 != nothing)
            markPrice = self.parseX18(markPriceX18);
            notionalX36 = stringMul(absoluteAmount, markPriceX18);
            notional = self.parseNumber(stringDiv(notionalX36, "1000000000000000000000000000000000000"));
        end
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("isolated") => nothing,
    Symbol("hedged") => false,
    Symbol("side") => side,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("entryPrice") => entryPrice,
    Symbol("markPrice") => markPrice,
    Symbol("notional") => notional,
    Symbol("leverage") => nothing,
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("percentage") => nothing
))

end
function isArchiveOrderClosed(self::Nado, order)
    amount = safeString(order, "amount");
    filled = safeString(order, "base_filled");
    if functions.ccxtruthy(@functions.ccxt_or((amount == nothing), (filled == nothing)))
            return false
    end
    return stringGe(stringAbs(filled), stringAbs(amount))

end
function parseOrder(self::Nado, order, market=nothing)
    id = nothing;
    timestamp = nothing;
    timeInForce = nothing;
    postOnly = nothing;
    side = nothing;
    price = nothing;
    amount = nothing;
    filled = nothing;
    remaining = nothing;
    cost = nothing;
    average = nothing;
    fee = nothing;
    lastTradeTimestamp = nothing;
    lastUpdateTimestamp = nothing;
    status = nothing;
    cancelOrderDigest = safeString(order, "digest");
    archiveFilled = safeString(order, "base_filled");
    if functions.ccxtruthy(archiveFilled != nothing)
        id = cancelOrderDigest;
        marketId = safeString(order, "product_id");
        market = self.safeMarket(marketId, market);
        amountString = safeString(order, "amount");
        if functions.ccxtruthy(amountString != nothing)
            side = functions.ccxtruthy(stringLt(amountString, "0")) ? "sell" : "buy";
            amount = self.parseX18(stringAbs(amountString));
        end
        filled = self.parseX18(stringAbs(archiveFilled));
        costString = safeString(order, "quote_filled");
        cost = functions.ccxtruthy((costString == nothing)) ? nothing : self.parseX18(stringAbs(costString));
        if functions.ccxtruthy(@functions.ccxt_and((filled != nothing), (cost != nothing)))
            average = stringDiv(numberToString(cost), numberToString(filled));
        end
        if functions.ccxtruthy(@functions.ccxt_and((amountString != nothing), (archiveFilled != nothing)))
            remaining = self.parseX18(stringMax(stringSub(stringAbs(amountString), stringAbs(archiveFilled)), "0"));
        end
        timestamp = safeTimestamp(order, "first_fill_timestamp");
        lastTradeTimestamp = safeTimestamp(order, "last_fill_timestamp");
        price = self.parseX18(safeString(order, "price_x18"));
        status = safeString(order, "status");
        if functions.ccxtruthy(status == nothing)
            if functions.ccxtruthy(self.isArchiveOrderClosed(order))
                status = "closed";
            end
        end
        feeCost = self.parseX18(safeString(order, "fee"));
        if functions.ccxtruthy(feeCost != nothing)
            fee = Dict{Symbol, Any}(
                Symbol("cost") => feeCost,
                Symbol("currency") => get(market, Symbol("quote"), nothing)
            );
        end
    elseif functions.ccxtruthy(cancelOrderDigest != nothing)
        id = cancelOrderDigest;
        marketId = safeString(order, "product_id");
        market = self.safeMarket(marketId, market);
        amountString = safeString(order, "amount");
        if functions.ccxtruthy(amountString != nothing)
            side = functions.ccxtruthy(stringLt(amountString, "0")) ? "sell" : "buy";
            amount = self.parseX18(stringAbs(amountString));
        end
        unfilledAmount = safeString(order, "unfilled_amount");
        if functions.ccxtruthy(unfilledAmount != nothing)
            remaining = self.parseX18(stringAbs(unfilledAmount));
        end
        timestamp = safeTimestamp(order, "placed_at");
        orderType = safeString(order, "order_type");
        timeInForce = self.parseOrderTimeInForce(orderType);
        postOnly = orderType == "post_only";
        price = self.parseX18(safeString(order, "price_x18"));
        status = safeString(order, "status", "open");
    else
        placeOrder = self.safeDict2(order, "place_order", "order", Dict{Symbol, Any}());
        rawOrder = self.safeDict(placeOrder, "order", Dict{Symbol, Any}());
        marketId = safeString(placeOrder, "product_id");
        market = self.safeMarket(marketId, market);
        data = self.safeDict(order, "data", Dict{Symbol, Any}());
        id = safeString(data, "digest");
        if functions.ccxtruthy(id == nothing)
            id = safeString(placeOrder, "digest");
            timestamp = safeTimestamp(order, "placed_at");
            lastUpdateTimestamp = safeTimestamp(order, "updated_at");
        end
        amountString = safeString(rawOrder, "amount");
        if functions.ccxtruthy(amountString != nothing)
            side = functions.ccxtruthy(stringLt(amountString, "0")) ? "sell" : "buy";
            amount = self.parseX18(stringAbs(amountString));
        end
        triggerStatus = self.safeDict(order, "status");
        if functions.ccxtruthy(triggerStatus != nothing)
            triggered = self.safeDict(triggerStatus, "triggered");
            if functions.ccxtruthy(triggered != nothing)
                status = "closed";
            else
                status = "canceled";
            end
        else
            status = safeString(order, "status", "rejected");
            if functions.ccxtruthy(@functions.ccxt_or((status == "success"), (findfirst("waiting", status) !== nothing)))
                status = "open";
            end
        end
        price = self.parseX18(safeString(rawOrder, "priceX18"));
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => "limit",
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("stopPrice") => nothing,
    Symbol("triggerPrice") => nothing,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market)

end
function parseOrderTimeInForce(self::Nado, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("default") => "GTC",
        Symbol("ioc") => "IOC",
        Symbol("fok") => "FOK",
        Symbol("post_only") => "PO"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function convertToX18(self::Nado, value)
    if functions.ccxtruthy(value == nothing)
        throw(ArgumentsRequired(string(self.id, " convertToX18() requires a value")));
    end
    return stringDiv(stringMul(value, "1000000000000000000"), "1", 0)

end
function parseX18(self::Nado, value)
    if functions.ccxtruthy(value == nothing)
            return nothing
    end
    return self.parseNumber(stringDiv(value, "1000000000000000000"))

end
function createOrderNonce(self::Nado, recvWindow)
    expires = self.sum(milliseconds(), recvWindow);
    return stringMul(numberToString(expires), "1048576")

end
function createOrderAppendix(self::Nado, isTriggerOrder, params=Dict())
    reduceOnly = self.safeBool(params, "reduceOnly", false);
    postOnly = self.isPostOnly(false, nothing, params);
    timeInForce = safeStringUpper(params, "timeInForce");
    orderType = 0;
    if functions.ccxtruthy(timeInForce == "IOC")
        orderType = 1;
    elseif functions.ccxtruthy(timeInForce == "FOK")
        orderType = 2;
    else
        if functions.ccxtruthy(@functions.ccxt_or(postOnly, (timeInForce == "PO")))
            orderType = 3;
        elseif functions.ccxtruthy(@functions.ccxt_and((timeInForce != nothing), (timeInForce != "GTC")))
            throw(BadRequest(string(self.id, " createOrder() only supports timeInForce values GTC, IOC, FOK, or PO")));
        end

    end
    appendix = "1";
    if functions.ccxtruthy(orderType != 0)
        appendix = stringAdd(appendix, stringMul(numberToString(orderType), "512"));
    end
    if functions.ccxtruthy(reduceOnly)
        appendix = stringAdd(appendix, "2048");
    end
    buildFee = self.safeBool(self.options, "builderFee", true);
    if functions.ccxtruthy(buildFee)
        builder = safeString(self.options, "builder", "4500");
        builderFeeRate = safeString(self.options, "feeRate", "10");
        appendix = stringAdd(appendix, stringMul(builder, "281474976710656"));
        appendix = stringAdd(appendix, stringMul(builderFeeRate, "274877906944"));
    end
    if functions.ccxtruthy(isTriggerOrder)
        appendix = stringAdd(appendix, "4096");
    end
    return appendix

end
function createSubaccount(self::Nado, walletAddress, subaccount="default")
    if functions.ccxtruthy(walletAddress == nothing)
        throw(ArgumentsRequired(string(self.id, " createSubaccount() requires walletAddress")));
    end
    if functions.ccxtruthy(subaccount == nothing)
        subaccount = "default";
    end
    address = lowercase(self.remove0xPrefix(walletAddress));
    if functions.ccxtruthy(length(address) != 40)
        throw(BadRequest(string(self.id, " createOrder() requires a 20-byte walletAddress")));
    end
    encoded = self.remove0xPrefix(self.stringToBase16(subaccount));
    if functions.ccxtruthy(functions.ccxt_gt(length(encoded), 24))
        throw(BadRequest(string(self.id, " createOrder() subaccount must fit in 12 bytes")));
    end
    return string("0x", address, self.padHex(encoded, 24, false))

end
function queryContracts(self::Nado, params=Dict())
    cachedContracts = self.safeDict(self.options, "gatewayContracts");
    if functions.ccxtruthy(cachedContracts != nothing)
            return cachedContracts
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "contracts"
    );
    response = self.gatewayPublicGetQuery(extend(request, params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    self.options[Symbol("gatewayContracts")] = data;
    return data

end
function orderVerifyingContract(self::Nado, productId)
    return string("0x", self.padHex(self.intToBase16(productId), 40))

end
function padHex(self::Nado, value, length, left=true)
    if functions.ccxtruthy(length == nothing)
        throw(ArgumentsRequired(string(self.id, " padHex() requires length")));
    end
    zeros_var = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    padded = functions.ccxtruthy(left) ? (string(zeros_var, value)) : (string(value, zeros_var));
    if functions.ccxtruthy(left)
        start = length(padded) - length;
            return functions.ccxt_slice(padded, start, length(padded))
    end
    return functions.ccxt_slice(padded, 0, length)

end
function signOrder(self::Nado, order, productId, chainId)
    domain = Dict{Symbol, Any}(
        Symbol("name") => "Nado",
        Symbol("version") => "0.0.1",
        Symbol("chainId") => chainId,
        Symbol("verifyingContract") => self.orderVerifyingContract(productId)
    );
    messageTypes = Dict{Symbol, Any}(
        Symbol("Order") => [Dict{Symbol, Any}(
        Symbol("name") => "sender",
        Symbol("type") => "bytes32"
    ), Dict{Symbol, Any}(
        Symbol("name") => "priceX18",
        Symbol("type") => "int128"
    ), Dict{Symbol, Any}(
        Symbol("name") => "amount",
        Symbol("type") => "int128"
    ), Dict{Symbol, Any}(
        Symbol("name") => "expiration",
        Symbol("type") => "uint64"
    ), Dict{Symbol, Any}(
        Symbol("name") => "nonce",
        Symbol("type") => "uint64"
    ), Dict{Symbol, Any}(
        Symbol("name") => "appendix",
        Symbol("type") => "uint128"
    )]
    );
    encoded = self.ethEncodeStructuredData(domain, messageTypes, order);
    hash = string("0x", hash(encoded, keccak, "hex"));
    return self.signHash(hash, self.privateKey)

end
function signCancellation(self::Nado, cancellation, chainId, endpointAddress)
    domain = Dict{Symbol, Any}(
        Symbol("name") => "Nado",
        Symbol("version") => "0.0.1",
        Symbol("chainId") => chainId,
        Symbol("verifyingContract") => endpointAddress
    );
    messageTypes = Dict{Symbol, Any}(
        Symbol("Cancellation") => [Dict{Symbol, Any}(
        Symbol("name") => "sender",
        Symbol("type") => "bytes32"
    ), Dict{Symbol, Any}(
        Symbol("name") => "productIds",
        Symbol("type") => "uint32[]"
    ), Dict{Symbol, Any}(
        Symbol("name") => "digests",
        Symbol("type") => "bytes32[]"
    ), Dict{Symbol, Any}(
        Symbol("name") => "nonce",
        Symbol("type") => "uint64"
    )]
    );
    encoded = self.ethEncodeStructuredData(domain, messageTypes, cancellation);
    hash = string("0x", hash(encoded, keccak, "hex"));
    return self.signHash(hash, self.privateKey)

end
function signCancellationProducts(self::Nado, cancellation, chainId, endpointAddress)
    domain = Dict{Symbol, Any}(
        Symbol("name") => "Nado",
        Symbol("version") => "0.0.1",
        Symbol("chainId") => chainId,
        Symbol("verifyingContract") => endpointAddress
    );
    messageTypes = Dict{Symbol, Any}(
        Symbol("CancellationProducts") => [Dict{Symbol, Any}(
        Symbol("name") => "sender",
        Symbol("type") => "bytes32"
    ), Dict{Symbol, Any}(
        Symbol("name") => "productIds",
        Symbol("type") => "uint32[]"
    ), Dict{Symbol, Any}(
        Symbol("name") => "nonce",
        Symbol("type") => "uint64"
    )]
    );
    encoded = self.ethEncodeStructuredData(domain, messageTypes, cancellation);
    hash = string("0x", hash(encoded, keccak, "hex"));
    return self.signHash(hash, self.privateKey)

end
function signFetchTriggerOrders(self::Nado, tx, chainId, endpointAddress)
    domain = Dict{Symbol, Any}(
        Symbol("name") => "Nado",
        Symbol("version") => "0.0.1",
        Symbol("chainId") => chainId,
        Symbol("verifyingContract") => endpointAddress
    );
    messageTypes = Dict{Symbol, Any}(
        Symbol("ListTriggerOrders") => [Dict{Symbol, Any}(
        Symbol("name") => "sender",
        Symbol("type") => "bytes32"
    ), Dict{Symbol, Any}(
        Symbol("name") => "recvTime",
        Symbol("type") => "uint64"
    )]
    );
    encoded = self.ethEncodeStructuredData(domain, messageTypes, tx);
    hash = string("0x", hash(encoded, keccak, "hex"));
    return self.signHash(hash, self.privateKey)

end
function signHash(self::Nado, hash, privateKey)
    if functions.ccxtruthy(privateKey == nothing)
        throw(ArgumentsRequired(string(self.id, " signHash() requires privateKey")));
    end
    signature = ecdsa(functions.ccxt_slice(hash, -64), functions.ccxt_slice(privateKey, -64), secp256k1, nothing);
    r = get(signature, Symbol("r"), nothing);
    s = get(signature, Symbol("s"), nothing);
    v = lowercase(self.intToBase16(self.sum(27, get(signature, Symbol("v"), nothing))));
    return string("0x", self.padHex(r, 64), self.padHex(s, 64), v)

end
function removeMarketSuffix(self::Nado, marketId)
    if functions.ccxtruthy(marketId == nothing)
            return nothing
    end
    if functions.ccxtruthy(endswith(marketId, "-PERP"))
            return functions.ccxt_slice(marketId, 0, -5)
    end
    return marketId

end
function sign(self::Nado, path, api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    endpoint = get(api, 1, nothing);
    if functions.ccxtruthy(isa(api, AbstractString))
        endpoint = api;
    end
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(endpoint), nothing);
    if functions.ccxtruthy(path != "")
        url += string("/", self.implodeParams(path, params));
    end
    query = omit(params, self.extractParams(path));
    headers = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_or((endpoint == "gateway"), (endpoint == "archive")))
        headers[Symbol("Accept-Encoding")] = "gzip, br, deflate";
    end
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        headers[Symbol("Content-Type")] = "application/json";
        body = json(query);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Nado, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    status = safeString(response, "status");
    errorCode = safeString(response, "error_code");
    error = safeString(response, "error");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((status == "failure"), (errorCode != nothing)), (error != nothing)))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), error, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Nado, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function gatewayPublicGetSymbols(self::Nado, params=Dict(), context=Dict())
    return request(self, "symbols", ["gateway", "public"], "GET", params, nothing, nothing, Dict())
end

function gatewayPublicGetQuery(self::Nado, params=Dict(), context=Dict())
    return request(self, "query", ["gateway", "public"], "GET", params, nothing, nothing, Dict())
end

function gatewayPublicGetEdgeQuery(self::Nado, params=Dict(), context=Dict())
    return request(self, "edge/query", ["gateway", "public"], "GET", params, nothing, nothing, Dict())
end

function gatewayPublicPostQuery(self::Nado, params=Dict(), context=Dict())
    return request(self, "query", ["gateway", "public"], "POST", params, nothing, nothing, Dict())
end

function gatewayPrivatePostExecute(self::Nado, params=Dict(), context=Dict())
    return request(self, "execute", ["gateway", "private"], "POST", params, nothing, nothing, Dict())
end

function gatewayV2PublicGetAssets(self::Nado, params=Dict(), context=Dict())
    return request(self, "assets", ["gatewayV2", "public"], "GET", params, nothing, nothing, Dict())
end

function gatewayV2PublicGetPairs(self::Nado, params=Dict(), context=Dict())
    return request(self, "pairs", ["gatewayV2", "public"], "GET", params, nothing, nothing, Dict())
end

function gatewayV2PublicGetOrderbook(self::Nado, params=Dict(), context=Dict())
    return request(self, "orderbook", ["gatewayV2", "public"], "GET", params, nothing, nothing, Dict())
end

function archivePost(self::Nado, params=Dict(), context=Dict())
    return request(self, "", "archive", "POST", params, nothing, nothing, Dict())
end

function archiveV2PublicGetTickers(self::Nado, params=Dict(), context=Dict())
    return request(self, "tickers", ["archiveV2", "public"], "GET", params, nothing, nothing, Dict())
end

function archiveV2PublicGetContracts(self::Nado, params=Dict(), context=Dict())
    return request(self, "contracts", ["archiveV2", "public"], "GET", params, nothing, nothing, Dict())
end

function archiveV2PublicGetTrades(self::Nado, params=Dict(), context=Dict())
    return request(self, "trades", ["archiveV2", "public"], "GET", params, nothing, nothing, Dict())
end

function triggerPrivatePostExecute(self::Nado, params=Dict(), context=Dict())
    return request(self, "execute", ["trigger", "private"], "POST", params, nothing, nothing, Dict())
end

function triggerPrivatePostQuery(self::Nado, params=Dict(), context=Dict())
    return request(self, "query", ["trigger", "private"], "POST", params, nothing, nothing, Dict())
end

function Nado(; kwargs...)
    inst = Nado(Exchange(), describe, createOrder, createOrderRequest, editOrder, editOrderRequest, cancelOrder, cancelAllOrders, cancelAllOrdersRequest, cancelOrders, cancelOrdersRequest, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchCanceledAndClosedOrders, fetchMyTrades, fetchBalance, fetchDeposits, fetchWithdrawals, queryTransactionsByEventType, fetchPositions, fetchTime, fetchStatus, fetchMarkets, fetchCurrencies, fetchTickers, fetchTicker, fetchFundingRate, fetchFundingHistory, fetchFundingRates, fetchOpenInterest, fetchOpenInterests, fetchOrderBook, fetchTrades, fetchOHLCV, parseOHLCV, parseTrade, parseFundingRate, parseFundingHistory, parseOpenInterest, parseTicker, parseCurrency, parseBalance, parseTransaction, parsePosition, isArchiveOrderClosed, parseOrder, parseOrderTimeInForce, convertToX18, parseX18, createOrderNonce, createOrderAppendix, createSubaccount, queryContracts, orderVerifyingContract, padHex, signOrder, signCancellation, signCancellationProducts, signFetchTriggerOrders, signHash, removeMarketSuffix, sign, handleErrors, gatewayPublicGetSymbols, gatewayPublicGetQuery, gatewayPublicGetEdgeQuery, gatewayPublicPostQuery, gatewayPrivatePostExecute, gatewayV2PublicGetAssets, gatewayV2PublicGetPairs, gatewayV2PublicGetOrderbook, archivePost, archiveV2PublicGetTickers, archiveV2PublicGetContracts, archiveV2PublicGetTrades, triggerPrivatePostExecute, triggerPrivatePostQuery)
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
