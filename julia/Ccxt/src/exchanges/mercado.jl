@kwdef mutable struct Mercado <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    createOrder::Function = createOrder
    cancelOrder::Function = cancelOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchMyTrades::Function = fetchMyTrades
    ordersToTrades::Function = ordersToTrades
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetCoins::Function = publicGetCoins
    publicGetCoinOrderbook::Function = publicGetCoinOrderbook
    publicGetCoinTicker::Function = publicGetCoinTicker
    publicGetCoinTrades::Function = publicGetCoinTrades
    publicGetCoinTradesFrom::Function = publicGetCoinTradesFrom
    publicGetCoinTradesFromTo::Function = publicGetCoinTradesFromTo
    publicGetCoinDaySummaryYearMonthDay::Function = publicGetCoinDaySummaryYearMonthDay
    privatePostCancelOrder::Function = privatePostCancelOrder
    privatePostGetAccountInfo::Function = privatePostGetAccountInfo
    privatePostGetOrder::Function = privatePostGetOrder
    privatePostGetWithdrawal::Function = privatePostGetWithdrawal
    privatePostListSystemMessages::Function = privatePostListSystemMessages
    privatePostListOrders::Function = privatePostListOrders
    privatePostListOrderbook::Function = privatePostListOrderbook
    privatePostPlaceBuyOrder::Function = privatePostPlaceBuyOrder
    privatePostPlaceSellOrder::Function = privatePostPlaceSellOrder
    privatePostPlaceMarketBuyOrder::Function = privatePostPlaceMarketBuyOrder
    privatePostPlaceMarketSellOrder::Function = privatePostPlaceMarketSellOrder
    privatePostWithdrawCoin::Function = privatePostWithdrawCoin
    v4PublicGetCoinCandle::Function = v4PublicGetCoinCandle
    v4PublicNetGetCandles::Function = v4PublicNetGetCandles

end
function describe(self::Mercado, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "mercado",
    Symbol("name") => "Mercado Bitcoin",
    Symbol("countries") => ["BR"],
    Symbol("rateLimit") => 1000,
    Symbol("version") => "v3",
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
        Symbol("createMarketOrder") => true,
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
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => "emulated",
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
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
        Symbol("fetchTickers") => false,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("15m") => "15m",
        Symbol("1h") => "1h",
        Symbol("3h") => "3h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://www.mercadobitcoin.net/api",
            Symbol("private") => "https://www.mercadobitcoin.net/tapi",
            Symbol("v4Public") => "https://www.mercadobitcoin.com.br/v4",
            Symbol("v4PublicNet") => "https://api.mercadobitcoin.net/api/v4"
        ),
        Symbol("www") => "https://www.mercadobitcoin.com.br",
        Symbol("doc") => ["https://www.mercadobitcoin.com.br/api-doc", "https://www.mercadobitcoin.com.br/trade-api"]
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => ["coins", "{coin}/orderbook/", "{coin}/ticker/", "{coin}/trades/", "{coin}/trades/{from}/", "{coin}/trades/{from}/{to}", "{coin}/day-summary/{year}/{month}/{day}/"]
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => ["cancel_order", "get_account_info", "get_order", "get_withdrawal", "list_system_messages", "list_orders", "list_orderbook", "place_buy_order", "place_sell_order", "place_market_buy_order", "place_market_sell_order", "withdraw_coin"]
        ),
        Symbol("v4Public") => Dict{Symbol, Any}(
            Symbol("get") => ["{coin}/candle/"]
        ),
        Symbol("v4PublicNet") => Dict{Symbol, Any}(
            Symbol("get") => ["candles"]
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("maker") => 0.003,
            Symbol("taker") => 0.007
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("BTC") => 0.001,
            Symbol("BCH") => 0.001,
            Symbol("ETH") => 0.01,
            Symbol("LTC") => 0.01,
            Symbol("XRP") => 0.1
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
                    Symbol("IOC") => false,
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
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
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => nothing,
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
    Symbol("precisionMode") => TICK_SIZE
))

end
function fetchMarkets(self::Mercado, params=Dict())
    response = Base.fetch(self.publicGetCoins(params));
    result = [];
    amountLimits = safeValue(self.options, "limits", Dict{Symbol, Any}());
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        coin = get(response, i + 1, nothing);
        baseId = coin;
        quoteId = "BRL";
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        id = string(quote_var, base);
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
    Symbol("active") => nothing,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber("1e-8"),
        Symbol("price") => self.parseNumber("1e-5")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(amountLimits, baseId),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1e-5"),
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => coin
));
        i += 1
    end
    return result

end
function fetchOrderBook(self::Mercado, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(market, Symbol("base"), nothing)
    );
    response = Base.fetch(self.publicGetCoinOrderbook(extend(request, params)));
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing))

end
function parseTicker(self::Mercado, ticker, market=nothing)
    symbol = self.safeSymbol(nothing, market);
    timestamp = safeTimestamp(ticker, "date");
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
    Symbol("baseVolume") => safeString(ticker, "vol"),
    Symbol("quoteVolume") => nothing,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Mercado, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(market, Symbol("base"), nothing)
    );
    response = Base.fetch(self.publicGetCoinTicker(extend(request, params)));
    ticker = safeValue(response, "ticker", Dict{Symbol, Any}());
    return self.parseTicker(ticker, market)

end
function parseTrade(self::Mercado, trade, market=nothing)
    timestamp = safeTimestamp2(trade, "date", "executed_timestamp");
    market = self.safeMarket(nothing, market);
    id = safeString2(trade, "tid", "operation_id");
    type_var = nothing;
    side = safeString(trade, "type");
    price = safeString(trade, "price");
    amount = safeString2(trade, "amount", "quantity");
    feeCost = safeString(trade, "fee_rate");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => nothing
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => nothing,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Mercado, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    method = "publicGetCoinTrades";
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(market, Symbol("base"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        method += "From";
        request[Symbol("from")] = self.parseToInt(since / 1000);
    end
    to = safeInteger(params, "to");
    if functions.ccxtruthy(to != nothing)
        method += "To";
    end
    response = Base.fetch(getproperty(self, Symbol(method))(self, extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function parseBalance(self::Mercado, response)
    data = safeValue(response, "response_data", Dict{Symbol, Any}());
    balances = safeValue(data, "balance", Dict{Symbol, Any}());
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    currencyIds = objectKeys(balances);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyIds)))
        currencyId = get(currencyIds, i + 1, nothing);
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(ccxt_in(currencyId, balances))
            balance = safeValue(balances, currencyId, Dict{Symbol, Any}());
            account = self.account();
            account[Symbol("free")] = safeString(balance, "available");
            account[Symbol("total")] = safeString(balance, "total");
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Mercado, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostGetAccountInfo(params));
    return self.parseBalance(response)

end
function createOrder(self::Mercado, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin_pair") => get(market, Symbol("id"), nothing)
    );
    method = string(capitalize(side), "Order");
    if functions.ccxtruthy(type_var == "limit")
        method = string("privatePostPlace", method);
        request[Symbol("limit_price")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), price);
        request[Symbol("quantity")] = self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount);
    else
        method = string("privatePostPlaceMarket", method);
        if functions.ccxtruthy(side == "buy")
            if functions.ccxtruthy(price == nothing)
                throw(InvalidOrder(string(self.id, " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount")));
            end
            amountString = numberToString(amount);
            priceString = numberToString(price);
            cost = self.parseToNumeric(stringMul(amountString, priceString));
            request[Symbol("cost")] = self.priceToPrecision(get(market, Symbol("symbol"), nothing), cost);
        else
            request[Symbol("quantity")] = self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount);
        end
    end
    response = Base.fetch(getproperty(self, Symbol(method))(self, extend(request, params)));
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => string(get(get(get(response, Symbol("response_data"), nothing), Symbol("order"), nothing), Symbol("order_id"), nothing))
), market)

end
function cancelOrder(self::Mercado, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin_pair") => get(market, Symbol("id"), nothing),
        Symbol("order_id") => id
    );
    response = Base.fetch(self.privatePostCancelOrder(extend(request, params)));
    responseData = safeValue(response, "response_data", Dict{Symbol, Any}());
    order = self.safeDict(responseData, "order", Dict{Symbol, Any}());
    return self.parseOrder(order, market)

end
function parseOrderStatus(self::Mercado, status)
    statuses = Dict{Symbol, Any}(
        Symbol("2") => "open",
        Symbol("3") => "canceled",
        Symbol("4") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Mercado, order, market=nothing)
    id = safeString(order, "order_id");
    order_type = safeString(order, "order_type");
    side = nothing;
    if functions.ccxtruthy(ccxt_in("order_type", order))
        side = functions.ccxtruthy((order_type == "1")) ? "buy" : "sell";
    end
    status = self.parseOrderStatus(safeString(order, "status"));
    marketId = safeString(order, "coin_pair");
    market = self.safeMarket(marketId, market);
    timestamp = safeTimestamp(order, "created_timestamp");
    fee = Dict{Symbol, Any}(
        Symbol("cost") => safeString(order, "fee"),
        Symbol("currency") => get(market, Symbol("quote"), nothing)
    );
    price = safeString(order, "limit_price");
    average = safeString(order, "executed_price_avg");
    amount = safeString(order, "quantity");
    filled = safeString(order, "executed_quantity");
    lastTradeTimestamp = safeTimestamp(order, "updated_timestamp");
    rawTrades = safeValue(order, "operations", []);
    symbol = get(market, Symbol("symbol"), nothing);
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => "limit",
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => nothing,
    Symbol("average") => average,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => rawTrades
), market)

end
function fetchOrder(self::Mercado, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin_pair") => get(market, Symbol("id"), nothing),
        Symbol("order_id") => ccxt_parseInt(id)
    );
    response = Base.fetch(self.privatePostGetOrder(extend(request, params)));
    responseData = safeValue(response, "response_data", Dict{Symbol, Any}());
    order = self.safeDict(responseData, "order");
    return self.parseOrder(order, market)

end
function withdraw(self::Mercado, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("quantity") => toFixed(amount, 10),
        Symbol("address") => address
    );
    if functions.ccxtruthy(code == "BRL")
        account_ref = (ccxt_in("account_ref", params));
        if functions.ccxtruthy(!functions.ccxtruthy(account_ref))
            throw(ArgumentsRequired(string(self.id, " withdraw() requires account_ref parameter to withdraw ", code)));
        end
    elseif functions.ccxtruthy(code != "LTC")
        tx_fee = (ccxt_in("tx_fee", params));
        if functions.ccxtruthy(!functions.ccxtruthy(tx_fee))
            throw(ArgumentsRequired(string(self.id, " withdraw() requires tx_fee parameter to withdraw ", code)));
        end
        if functions.ccxtruthy(code == "XRP")
            if functions.ccxtruthy(tag == nothing)
                if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("destination_tag", params))))
                    throw(ArgumentsRequired(string(self.id, " withdraw() requires a tag argument or destination_tag parameter to withdraw ", code)));
                end
            else
                request[Symbol("destination_tag")] = tag;
            end
        end
    end
    response = Base.fetch(self.privatePostWithdrawCoin(extend(request, params)));
    responseData = safeValue(response, "response_data", Dict{Symbol, Any}());
    withdrawal = self.safeDict(responseData, "withdrawal");
    return self.parseTransaction(withdrawal, currency)

end
function parseTransaction(self::Mercado, transaction, currency=nothing)
    currency = self.safeCurrency(nothing, currency);
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("network") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("address") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("amount") => nothing,
    Symbol("type") => nothing,
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("status") => nothing,
    Symbol("updated") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => nothing,
    Symbol("info") => transaction
)

end
function parseOHLCV(self::Mercado, ohlcv, market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
function fetchOHLCV(self::Mercado, symbol, timeframe="15m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("resolution") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("symbol") => string(get(market, Symbol("base"), nothing), "-", get(market, Symbol("quote"), nothing))
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = self.parseToInt(since / 1000);
        request[Symbol("to")] = self.sum(get(request, Symbol("from"), nothing), limit * self.parseTimeframe(timeframe));
    else
        request[Symbol("to")] = seconds();
        request[Symbol("from")] = get(request, Symbol("to"), nothing) - (limit * self.parseTimeframe(timeframe));
    end
    response = Base.fetch(self.v4PublicNetGetCandles(extend(request, params)));
    candles = self.convertTradingViewToOHLCV(response, "t", "o", "h", "l", "c", "v");
    return self.parseOHLCVs(candles, market, timeframe, since, limit)

end
function fetchOrders(self::Mercado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin_pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostListOrders(extend(request, params)));
    responseData = safeValue(response, "response_data", Dict{Symbol, Any}());
    orders = self.safeList(responseData, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Mercado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin_pair") => get(market, Symbol("id"), nothing),
        Symbol("status_list") => "[2]"
    );
    response = Base.fetch(self.privatePostListOrders(extend(request, params)));
    responseData = safeValue(response, "response_data", Dict{Symbol, Any}());
    orders = self.safeList(responseData, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchMyTrades(self::Mercado, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin_pair") => get(market, Symbol("id"), nothing),
        Symbol("has_fills") => true
    );
    response = Base.fetch(self.privatePostListOrders(extend(request, params)));
    responseData = safeValue(response, "response_data", Dict{Symbol, Any}());
    ordersRaw = safeValue(responseData, "orders", []);
    orders = self.parseOrders(ordersRaw, market, since, limit);
    trades = self.ordersToTrades(orders);
    return self.filterBySymbolSinceLimit(trades, get(market, Symbol("symbol"), nothing), since, limit)

end
function ordersToTrades(self::Mercado, orders)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        trades = safeValue(get(orders, i + 1, nothing), "trades", []);
        y = 0
        while functions.ccxtruthy(functions.ccxt_lt(y, length(trades)))
            push!(result, get(trades, y + 1, nothing));
            y += 1
        end
        i += 1
    end
    return result

end
function sign(self::Mercado, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/");
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((api == "public"), (api == "v4Public")), (api == "v4PublicNet")))
        url += self.implodeParams(path, params);
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        url += string(self.version, "/");
        nonce = self.nonce();
        body = self.urlencode(extend(Dict{Symbol, Any}(
    Symbol("tapi_method") => path,
    Symbol("tapi_nonce") => nonce
), params));
        auth = string("/tapi/", self.version, "/", "?", body);
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/x-www-form-urlencoded",
            Symbol("TAPI-ID") => self.apiKey,
            Symbol("TAPI-MAC") => self.hmac(self.encode(auth), self.encode(self.secret), sha512)
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Mercado, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorMessage = safeValue(response, "error_message");
    if functions.ccxtruthy(errorMessage != nothing)
        throw(ExchangeError(string(self.id, " ", json(response))));
    end
    return nothing

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Mercado, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetCoins(self::Mercado, params=Dict(), context=Dict())
    return request(self, "coins", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCoinOrderbook(self::Mercado, params=Dict(), context=Dict())
    return request(self, "{coin}/orderbook/", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCoinTicker(self::Mercado, params=Dict(), context=Dict())
    return request(self, "{coin}/ticker/", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCoinTrades(self::Mercado, params=Dict(), context=Dict())
    return request(self, "{coin}/trades/", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCoinTradesFrom(self::Mercado, params=Dict(), context=Dict())
    return request(self, "{coin}/trades/{from}/", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCoinTradesFromTo(self::Mercado, params=Dict(), context=Dict())
    return request(self, "{coin}/trades/{from}/{to}", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCoinDaySummaryYearMonthDay(self::Mercado, params=Dict(), context=Dict())
    return request(self, "{coin}/day-summary/{year}/{month}/{day}/", "public", "GET", params, nothing, nothing, Dict())
end

function privatePostCancelOrder(self::Mercado, params=Dict(), context=Dict())
    return request(self, "cancel_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetAccountInfo(self::Mercado, params=Dict(), context=Dict())
    return request(self, "get_account_info", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetOrder(self::Mercado, params=Dict(), context=Dict())
    return request(self, "get_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetWithdrawal(self::Mercado, params=Dict(), context=Dict())
    return request(self, "get_withdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostListSystemMessages(self::Mercado, params=Dict(), context=Dict())
    return request(self, "list_system_messages", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostListOrders(self::Mercado, params=Dict(), context=Dict())
    return request(self, "list_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostListOrderbook(self::Mercado, params=Dict(), context=Dict())
    return request(self, "list_orderbook", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPlaceBuyOrder(self::Mercado, params=Dict(), context=Dict())
    return request(self, "place_buy_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPlaceSellOrder(self::Mercado, params=Dict(), context=Dict())
    return request(self, "place_sell_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPlaceMarketBuyOrder(self::Mercado, params=Dict(), context=Dict())
    return request(self, "place_market_buy_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPlaceMarketSellOrder(self::Mercado, params=Dict(), context=Dict())
    return request(self, "place_market_sell_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdrawCoin(self::Mercado, params=Dict(), context=Dict())
    return request(self, "withdraw_coin", "private", "POST", params, nothing, nothing, Dict())
end

function v4PublicGetCoinCandle(self::Mercado, params=Dict(), context=Dict())
    return request(self, "{coin}/candle/", "v4Public", "GET", params, nothing, nothing, Dict())
end

function v4PublicNetGetCandles(self::Mercado, params=Dict(), context=Dict())
    return request(self, "candles", "v4PublicNet", "GET", params, nothing, nothing, Dict())
end

function Mercado(; kwargs...)
    inst = Mercado(Exchange(), describe, fetchMarkets, fetchOrderBook, parseTicker, fetchTicker, parseTrade, fetchTrades, parseBalance, fetchBalance, createOrder, cancelOrder, parseOrderStatus, parseOrder, fetchOrder, withdraw, parseTransaction, parseOHLCV, fetchOHLCV, fetchOrders, fetchOpenOrders, fetchMyTrades, ordersToTrades, sign, handleErrors, publicGetCoins, publicGetCoinOrderbook, publicGetCoinTicker, publicGetCoinTrades, publicGetCoinTradesFrom, publicGetCoinTradesFromTo, publicGetCoinDaySummaryYearMonthDay, privatePostCancelOrder, privatePostGetAccountInfo, privatePostGetOrder, privatePostGetWithdrawal, privatePostListSystemMessages, privatePostListOrders, privatePostListOrderbook, privatePostPlaceBuyOrder, privatePostPlaceSellOrder, privatePostPlaceMarketBuyOrder, privatePostPlaceMarketSellOrder, privatePostWithdrawCoin, v4PublicGetCoinCandle, v4PublicNetGetCandles)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
