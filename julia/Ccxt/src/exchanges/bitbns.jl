@kwdef mutable struct Bitbns <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchStatus::Function = fetchStatus
    fetchMarkets::Function = fetchMarkets
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTickers::Function = fetchTickers
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseStatus::Function = parseStatus
    parseOrder::Function = parseOrder
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    parseTrade::Function = parseTrade
    fetchMyTrades::Function = fetchMyTrades
    fetchTrades::Function = fetchTrades
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatusByType::Function = parseTransactionStatusByType
    parseTransaction::Function = parseTransaction
    fetchDepositAddress::Function = fetchDepositAddress
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    wwwGetOrderFetchMarkets::Function = wwwGetOrderFetchMarkets
    wwwGetOrderFetchTickers::Function = wwwGetOrderFetchTickers
    wwwGetOrderFetchOrderbook::Function = wwwGetOrderFetchOrderbook
    wwwGetOrderGetTickerWithVolume::Function = wwwGetOrderGetTickerWithVolume
    wwwGetExchangeDataOhlc::Function = wwwGetExchangeDataOhlc
    wwwGetExchangeDataOrderBook::Function = wwwGetExchangeDataOrderBook
    wwwGetExchangeDataTradedetails::Function = wwwGetExchangeDataTradedetails
    v1GetPlatformStatus::Function = v1GetPlatformStatus
    v1GetTickers::Function = v1GetTickers
    v1GetOrderbookSellSymbol::Function = v1GetOrderbookSellSymbol
    v1GetOrderbookBuySymbol::Function = v1GetOrderbookBuySymbol
    v1PostCurrentCoinBalanceEVERYTHING::Function = v1PostCurrentCoinBalanceEVERYTHING
    v1PostGetApiUsageStatusUSAGE::Function = v1PostGetApiUsageStatusUSAGE
    v1PostGetOrderSocketTokenUSAGE::Function = v1PostGetOrderSocketTokenUSAGE
    v1PostCurrentCoinBalanceSymbol::Function = v1PostCurrentCoinBalanceSymbol
    v1PostOrderStatusSymbol::Function = v1PostOrderStatusSymbol
    v1PostDepositHistorySymbol::Function = v1PostDepositHistorySymbol
    v1PostWithdrawHistorySymbol::Function = v1PostWithdrawHistorySymbol
    v1PostWithdrawHistoryAllSymbol::Function = v1PostWithdrawHistoryAllSymbol
    v1PostDepositHistoryAllSymbol::Function = v1PostDepositHistoryAllSymbol
    v1PostListOpenOrdersSymbol::Function = v1PostListOpenOrdersSymbol
    v1PostListOpenStopOrdersSymbol::Function = v1PostListOpenStopOrdersSymbol
    v1PostGetCoinAddressSymbol::Function = v1PostGetCoinAddressSymbol
    v1PostPlaceSellOrderSymbol::Function = v1PostPlaceSellOrderSymbol
    v1PostPlaceBuyOrderSymbol::Function = v1PostPlaceBuyOrderSymbol
    v1PostBuyStopLossSymbol::Function = v1PostBuyStopLossSymbol
    v1PostSellStopLossSymbol::Function = v1PostSellStopLossSymbol
    v1PostCancelOrderSymbol::Function = v1PostCancelOrderSymbol
    v1PostCancelStopLossOrderSymbol::Function = v1PostCancelStopLossOrderSymbol
    v1PostListExecutedOrdersSymbol::Function = v1PostListExecutedOrdersSymbol
    v1PostPlaceMarketOrderSymbol::Function = v1PostPlaceMarketOrderSymbol
    v1PostPlaceMarketOrderQntySymbol::Function = v1PostPlaceMarketOrderQntySymbol
    v2PostOrders::Function = v2PostOrders
    v2PostCancel::Function = v2PostCancel
    v2PostGetordersnew::Function = v2PostGetordersnew
    v2PostMarginOrders::Function = v2PostMarginOrders

end
function describe(self::Bitbns, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitbns",
    Symbol("name") => "Bitbns",
    Symbol("countries") => ["IN"],
    Symbol("rateLimit") => 1000,
    Symbol("certified") => false,
    Symbol("version") => "v2",
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => nothing,
        Symbol("cancelAllOrders") => false,
        Symbol("cancelOrder") => true,
        Symbol("createOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("fechCurrencies") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingRate") => false,
        Symbol("fetchFundingRateHistory") => false,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => "emulated",
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("transfer") => false,
        Symbol("withdraw") => false
    ),
    Symbol("hostname") => "bitbns.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/a5b9a562-cdd8-4bea-9fa7-fd24c1dad3d9",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("www") => "https://{hostname}",
            Symbol("v1") => "https://api.{hostname}/api/trade/v1",
            Symbol("v2") => "https://api.{hostname}/api/trade/v2"
        ),
        Symbol("www") => "https://bitbns.com",
        Symbol("referral") => "https://ref.bitbns.com/1090961",
        Symbol("doc") => ["https://bitbns.com/trade/#/api-trading/"],
        Symbol("fees") => "https://bitbns.com/fees"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("www") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("order/fetchMarkets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/fetchTickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/fetchOrderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order/getTickerWithVolume") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchangeData/ohlc") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchangeData/orderBook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchangeData/tradedetails") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("platform/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook/sell/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderbook/buy/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("currentCoinBalance/EVERYTHING") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getApiUsageStatus/USAGE") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getOrderSocketToken/USAGE") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currentCoinBalance/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("orderStatus/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depositHistory/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawHistory/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawHistoryAll/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depositHistoryAll/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listOpenOrders/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listOpenStopOrders/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getCoinAddress/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("placeSellOrder/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("placeBuyOrder/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("buyStopLoss/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sellStopLoss/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelOrder/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancelStopLossOrder/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listExecutedOrders/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("placeMarketOrder/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("placeMarketOrderQnty/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("getordersnew") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("marginOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "quote",
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0025"),
            Symbol("maker") => self.parseNumber("0.0025")
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
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
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 100
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
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("400") => BadRequest,
            Symbol("409") => BadSymbol,
            Symbol("416") => InsufficientFunds,
            Symbol("417") => OrderNotFound
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    )
))

end
function fetchStatus(self::Bitbns, params=Dict())
    response = Base.fetch(self.v1GetPlatformStatus(params));
    statusRaw = safeString(response, "status");
    return Dict{Symbol, Any}(
    Symbol("status") => safeString(Dict{Symbol, Any}(
    Symbol("1") => "ok"
), statusRaw, statusRaw),
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchMarkets(self::Bitbns, params=Dict())
    response = Base.fetch(self.wwwGetOrderFetchMarkets(params));
    result = [];
    rawMarkets = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawMarkets)))
        market = get(rawMarkets, i + 1, nothing);
        id = safeString(market, "id");
        baseId = safeString(market, "base");
        quoteId = safeString(market, "quote");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        marketPrecision = self.safeDict(market, "precision", Dict{Symbol, Any}());
        marketLimits = self.safeDict(market, "limits", Dict{Symbol, Any}());
        amountLimits = self.safeDict(marketLimits, "amount", Dict{Symbol, Any}());
        priceLimits = self.safeDict(marketLimits, "price", Dict{Symbol, Any}());
        costLimits = self.safeDict(marketLimits, "cost", Dict{Symbol, Any}());
        usdt = (quoteId == "USDT");
        uppercaseId = functions.ccxtruthy(usdt) ? (string(baseId, "_", quoteId)) : baseId;
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("uppercaseId") => uppercaseId,
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
    Symbol("active") => self.safeBool(market, "active"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(marketPrecision, "amount"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(marketPrecision, "price")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(amountLimits, "min"),
            Symbol("max") => self.safeNumber(amountLimits, "max")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(priceLimits, "min"),
            Symbol("max") => self.safeNumber(priceLimits, "max")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(costLimits, "min"),
            Symbol("max") => self.safeNumber(costLimits, "max")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function fetchOrderBook(self::Bitbns, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.wwwGetOrderFetchOrderbook(extend(request, params)));
    timestamp = safeInteger(response, "timestamp");
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp)

end
function parseTicker(self::Bitbns, ticker, market=nothing)
    timestamp = safeInteger(ticker, "timestamp");
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market);
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => safeString(ticker, "bidVolume"),
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => safeString(ticker, "askVolume"),
    Symbol("vwap") => safeString(ticker, "vwap"),
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => safeString(ticker, "previousClose"),
    Symbol("change") => safeString(ticker, "change"),
    Symbol("percentage") => safeString(ticker, "percentage"),
    Symbol("average") => safeString(ticker, "average"),
    Symbol("baseVolume") => safeString(ticker, "baseVolume"),
    Symbol("quoteVolume") => safeString(ticker, "quoteVolume"),
    Symbol("info") => ticker
), market)

end
function fetchTickers(self::Bitbns, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.wwwGetOrderFetchTickers(params));
    return self.parseTickers(response, symbols)

end
function parseBalance(self::Bitbns, response)
    timestamp = nothing;
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    keys_var = objectKeys(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        parts = split(key, "availableorder");
        numParts = length(parts);
        if functions.ccxtruthy(functions.ccxt_gt(numParts, 1))
            currencyId = safeString(parts, 1);
            account = self.account();
            account[Symbol("free")] = safeString(data, key);
            account[Symbol("used")] = safeString(data, string("inorder", currencyId));
            if functions.ccxtruthy(currencyId == "Money")
                currencyId = "INR";
            end
            code = self.safeCurrencyCode(currencyId);
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Bitbns, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v1PostCurrentCoinBalanceEVERYTHING(params));
    return self.parseBalance(response)

end
function parseStatus(self::Bitbns, status)
    statuses = Dict{Symbol, Any}(
        Symbol("-1") => "cancelled",
        Symbol("0") => "open",
        Symbol("1") => "open",
        Symbol("2") => "done"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bitbns, order, market=nothing)
    id = safeString2(order, "id", "entry_id");
    datetime = safeString(order, "time");
    triggerPrice = safeString(order, "t_rate");
    side = safeString(order, "type");
    if functions.ccxtruthy(side == "0")
        side = "buy";
    elseif functions.ccxtruthy(side == "1")
        side = "sell";
    end
    data = safeString(order, "data");
    status = safeString(order, "status");
    if functions.ccxtruthy(data == "Successfully cancelled the order")
        status = "cancelled";
    else
        status = self.parseStatus(status);
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => self.parse8601(datetime),
    Symbol("datetime") => datetime,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => safeString(order, "rate"),
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => safeString(order, "btc"),
    Symbol("cost") => nothing,
    Symbol("average") => nothing,
    Symbol("filled") => nothing,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => nothing,
        Symbol("currency") => nothing,
        Symbol("rate") => nothing
    ),
    Symbol("trades") => nothing
), market)

end
function createOrder(self::Bitbns, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "t_rate"]);
    targetRate = safeString(params, "target_rate");
    trailRate = safeString(params, "trail_rate");
    params = omit(params, ["triggerPrice", "stopPrice", "trail_rate", "target_rate", "t_rate"]);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("side") => uppercase(side),
        Symbol("symbol") => get(market, Symbol("uppercaseId"), nothing),
        Symbol("quantity") => self.amountToPrecision(symbol, amount)
    );
    method = "v2PostOrders";
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("rate")] = self.priceToPrecision(symbol, price);
    else
        method = "v1PostPlaceMarketOrderQntySymbol";
        request[Symbol("market")] = get(market, Symbol("quoteId"), nothing);
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("t_rate")] = self.priceToPrecision(symbol, triggerPrice);
    end
    if functions.ccxtruthy(targetRate != nothing)
        request[Symbol("target_rate")] = self.priceToPrecision(symbol, targetRate);
    end
    if functions.ccxtruthy(trailRate != nothing)
        request[Symbol("trail_rate")] = self.priceToPrecision(symbol, trailRate);
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    parsed = functions.ccxtruthy((response == nothing)) ? Dict{Symbol, Any}() : response;
    return self.parseOrder(parsed, market)

end
function cancelOrder(self::Bitbns, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isTrigger = self.safeBool2(params, "trigger", "stop");
    params = omit(params, ["trigger", "stop"]);
    request = Dict{Symbol, Any}(
        Symbol("entry_id") => id,
        Symbol("symbol") => get(market, Symbol("uppercaseId"), nothing)
    );
    response = nothing;
    tail = functions.ccxtruthy(isTrigger) ? "StopLossOrder" : "Order";
    quoteSide = functions.ccxtruthy((get(market, Symbol("quoteId"), nothing) == "USDT")) ? "usdtcancel" : "cancel";
    quoteSide += tail;
    request[Symbol("side")] = quoteSide;
    response = Base.fetch(self.v2PostCancel(extend(request, params)));
    parsed = functions.ccxtruthy((response == nothing)) ? Dict{Symbol, Any}() : response;
    return self.parseOrder(parsed, market)

end
function fetchOrder(self::Bitbns, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("entry_id") => id
    );
    trigger = self.safeBool2(params, "trigger", "stop");
    if functions.ccxtruthy(trigger)
        throw(BadRequest(string(self.id, " fetchOrder cannot fetch stop orders")));
    end
    response = Base.fetch(self.v1PostOrderStatusSymbol(extend(request, params)));
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseOrder(first_var, market)

end
function fetchOpenOrders(self::Bitbns, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isTrigger = self.safeBool2(params, "trigger", "stop");
    params = omit(params, ["trigger", "stop"]);
    quoteSide = functions.ccxtruthy((get(market, Symbol("quoteId"), nothing) == "USDT")) ? "usdtListOpen" : "listOpen";
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("uppercaseId"), nothing),
        Symbol("page") => 0,
        Symbol("side") => functions.ccxtruthy(isTrigger) ? (string(quoteSide, "StopOrders")) : (string(quoteSide, "Orders"))
    );
    response = Base.fetch(self.v2PostGetordersnew(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function parseTrade(self::Bitbns, trade, market=nothing)
    market = self.safeMarket(nothing, market);
    orderId = safeString2(trade, "id", "tradeId");
    timestamp = self.parse8601(safeString(trade, "date"));
    timestamp = safeInteger(trade, "timestamp", timestamp);
    priceString = safeString2(trade, "rate", "price");
    amountString = safeString(trade, "amount");
    side = safeStringLower(trade, "type");
    if functions.ccxtruthy(side != nothing)
        if functions.ccxtruthy(findfirst("buy", side) !== nothing)
            side = "buy";
        elseif functions.ccxtruthy(findfirst("sell", side) !== nothing)
            side = "sell";
        end
    end
    factor = safeString(trade, "factor");
    costString = nothing;
    if functions.ccxtruthy(factor != nothing)
        amountString = stringDiv(amountString, factor);
    else
        amountString = safeString(trade, "base_volume");
        costString = safeString(trade, "quote_volume");
    end
    symbol = get(market, Symbol("symbol"), nothing);
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyCode = get(market, Symbol("quote"), nothing);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => orderId,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market)

end
function fetchMyTrades(self::Bitbns, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("page") => 0
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since")] = self.iso8601(since);
    end
    response = Base.fetch(self.v1PostListExecutedOrdersSymbol(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function fetchTrades(self::Bitbns, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(market, Symbol("baseId"), nothing),
        Symbol("market") => get(market, Symbol("quoteId"), nothing)
    );
    response = Base.fetch(self.wwwGetExchangeDataTradedetails(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function fetchDeposits(self::Bitbns, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDeposits() requires a currency code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing),
        Symbol("page") => 0
    );
    response = Base.fetch(self.v1PostDepositHistorySymbol(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function fetchWithdrawals(self::Bitbns, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchWithdrawals() requires a currency code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing),
        Symbol("page") => 0
    );
    response = Base.fetch(self.v1PostWithdrawHistorySymbol(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function parseTransactionStatusByType(self::Bitbns, status, type_var=nothing)
    statusesByType = Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("0") => "pending",
            Symbol("1") => "ok"
        ),
        Symbol("withdrawal") => Dict{Symbol, Any}(
            Symbol("0") => "pending",
            Symbol("1") => "canceled",
            Symbol("2") => "pending",
            Symbol("3") => "failed",
            Symbol("4") => "pending",
            Symbol("5") => "failed",
            Symbol("6") => "ok"
        )
    );
    statuses = self.safeDict(statusesByType, type_var, Dict{Symbol, Any}());
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bitbns, transaction, currency=nothing)
    currencyId = safeString(transaction, "unit");
    code = self.safeCurrencyCode(currencyId, currency);
    timestamp = self.parse8601(safeString2(transaction, "date", "timestamp"));
    type_var = safeString(transaction, "type");
    expTime = safeString(transaction, "expTime", "");
    status = nothing;
    if functions.ccxtruthy(type_var != nothing)
        if functions.ccxtruthy(findfirst("deposit", type_var) !== nothing)
            type_var = "deposit";
            status = "ok";
        elseif functions.ccxtruthy(@functions.ccxt_or(findfirst("withdraw", type_var) !== nothing, findfirst("withdraw", expTime) !== nothing))
            type_var = "withdrawal";
        end
    end
    amount = self.safeNumber(transaction, "amount");
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => nothing,
    Symbol("txid") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
function fetchDepositAddress(self::Bitbns, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v1PostGetCoinAddressSymbol(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    address = safeString(data, "token");
    tag = safeString(data, "tag");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function nonce(self::Bitbns, )
    return milliseconds()

end
function sign(self::Bitbns, path, api="www", method="GET", params=Dict(), headers=nothing, body=nothing)
    urls = self.urls;
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(api, get(urls, Symbol("api"), nothing)))))
        throw(ExchangeError(string(self.id, " does not have a testnet/sandbox URL for ", api, " endpoints")));
    end
    if functions.ccxtruthy(api != "www")
        self.checkRequiredCredentials();
        headers = Dict{Symbol, Any}(
            Symbol("X-BITBNS-APIKEY") => self.apiKey
        );
    end
    baseUrl = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing));
    url = string(baseUrl, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    nonce = string(self.nonce());
    if functions.ccxtruthy(method == "GET")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    elseif functions.ccxtruthy(method == "POST")
        if functions.ccxtruthy(length(objectKeys(query)))
            body = json(query);
        else
            body = "{}";
        end
        auth = Dict{Symbol, Any}(
            Symbol("timeStamp_nonce") => nonce,
            Symbol("body") => body
        );
        payload = self.stringToBase64(json(auth));
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha512);
        headers = functions.ccxtruthy((headers == nothing)) ? Dict{Symbol, Any}() : headers;
        headers[Symbol("X-BITBNS-PAYLOAD")] = payload;
        headers[Symbol("X-BITBNS-SIGNATURE")] = signature;
        headers[Symbol("Content-Type")] = "application/x-www-form-urlencoded";
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitbns, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    code = safeString(response, "code");
    message = safeString(response, "msg");
    error = @functions.ccxt_and(@functions.ccxt_and((code != nothing), (code != "200")), (code != "204"));
    if functions.ccxtruthy(@functions.ccxt_or(error, (message != nothing)))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitbns, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function wwwGetOrderFetchMarkets(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "order/fetchMarkets", "www", "GET", params, nothing, nothing, Dict())
end

function wwwGetOrderFetchTickers(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "order/fetchTickers", "www", "GET", params, nothing, nothing, Dict())
end

function wwwGetOrderFetchOrderbook(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "order/fetchOrderbook", "www", "GET", params, nothing, nothing, Dict())
end

function wwwGetOrderGetTickerWithVolume(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "order/getTickerWithVolume", "www", "GET", params, nothing, nothing, Dict())
end

function wwwGetExchangeDataOhlc(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "exchangeData/ohlc", "www", "GET", params, nothing, nothing, Dict())
end

function wwwGetExchangeDataOrderBook(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "exchangeData/orderBook", "www", "GET", params, nothing, nothing, Dict())
end

function wwwGetExchangeDataTradedetails(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "exchangeData/tradedetails", "www", "GET", params, nothing, nothing, Dict())
end

function v1GetPlatformStatus(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "platform/status", "v1", "GET", params, nothing, nothing, Dict())
end

function v1GetTickers(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "tickers", "v1", "GET", params, nothing, nothing, Dict())
end

function v1GetOrderbookSellSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "orderbook/sell/{symbol}", "v1", "GET", params, nothing, nothing, Dict())
end

function v1GetOrderbookBuySymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "orderbook/buy/{symbol}", "v1", "GET", params, nothing, nothing, Dict())
end

function v1PostCurrentCoinBalanceEVERYTHING(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "currentCoinBalance/EVERYTHING", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostGetApiUsageStatusUSAGE(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "getApiUsageStatus/USAGE", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostGetOrderSocketTokenUSAGE(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "getOrderSocketToken/USAGE", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostCurrentCoinBalanceSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "currentCoinBalance/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostOrderStatusSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "orderStatus/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostDepositHistorySymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "depositHistory/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostWithdrawHistorySymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "withdrawHistory/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostWithdrawHistoryAllSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "withdrawHistoryAll/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostDepositHistoryAllSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "depositHistoryAll/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostListOpenOrdersSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "listOpenOrders/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostListOpenStopOrdersSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "listOpenStopOrders/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostGetCoinAddressSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "getCoinAddress/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostPlaceSellOrderSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "placeSellOrder/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostPlaceBuyOrderSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "placeBuyOrder/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostBuyStopLossSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "buyStopLoss/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostSellStopLossSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "sellStopLoss/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostCancelOrderSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "cancelOrder/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostCancelStopLossOrderSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "cancelStopLossOrder/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostListExecutedOrdersSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "listExecutedOrders/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostPlaceMarketOrderSymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "placeMarketOrder/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v1PostPlaceMarketOrderQntySymbol(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "placeMarketOrderQnty/{symbol}", "v1", "POST", params, nothing, nothing, Dict())
end

function v2PostOrders(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "orders", "v2", "POST", params, nothing, nothing, Dict())
end

function v2PostCancel(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "cancel", "v2", "POST", params, nothing, nothing, Dict())
end

function v2PostGetordersnew(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "getordersnew", "v2", "POST", params, nothing, nothing, Dict())
end

function v2PostMarginOrders(self::Bitbns, params=Dict(), context=Dict())
    return request(self, "marginOrders", "v2", "POST", params, nothing, nothing, Dict())
end

function Bitbns(; kwargs...)
    inst = Bitbns(Exchange(), describe, fetchStatus, fetchMarkets, fetchOrderBook, parseTicker, fetchTickers, parseBalance, fetchBalance, parseStatus, parseOrder, createOrder, cancelOrder, fetchOrder, fetchOpenOrders, parseTrade, fetchMyTrades, fetchTrades, fetchDeposits, fetchWithdrawals, parseTransactionStatusByType, parseTransaction, fetchDepositAddress, nonce, sign, handleErrors, wwwGetOrderFetchMarkets, wwwGetOrderFetchTickers, wwwGetOrderFetchOrderbook, wwwGetOrderGetTickerWithVolume, wwwGetExchangeDataOhlc, wwwGetExchangeDataOrderBook, wwwGetExchangeDataTradedetails, v1GetPlatformStatus, v1GetTickers, v1GetOrderbookSellSymbol, v1GetOrderbookBuySymbol, v1PostCurrentCoinBalanceEVERYTHING, v1PostGetApiUsageStatusUSAGE, v1PostGetOrderSocketTokenUSAGE, v1PostCurrentCoinBalanceSymbol, v1PostOrderStatusSymbol, v1PostDepositHistorySymbol, v1PostWithdrawHistorySymbol, v1PostWithdrawHistoryAllSymbol, v1PostDepositHistoryAllSymbol, v1PostListOpenOrdersSymbol, v1PostListOpenStopOrdersSymbol, v1PostGetCoinAddressSymbol, v1PostPlaceSellOrderSymbol, v1PostPlaceBuyOrderSymbol, v1PostBuyStopLossSymbol, v1PostSellStopLossSymbol, v1PostCancelOrderSymbol, v1PostCancelStopLossOrderSymbol, v1PostListExecutedOrdersSymbol, v1PostPlaceMarketOrderSymbol, v1PostPlaceMarketOrderQntySymbol, v2PostOrders, v2PostCancel, v2PostGetordersnew, v2PostMarginOrders)
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
